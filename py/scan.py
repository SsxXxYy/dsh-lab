"""设备库存管理 — PyVISA + asglib 联合扫描"""
import json
import time
from pathlib import Path

# 设备清单路径（相对于项目根目录）
INVENTORY_PATH = Path(__file__).parent.parent / "devices" / "devices_inventory.json"


def scan_instruments() -> dict:
    """
    扫描 VISA (PyVISA) 与 ASG (asglib) 设备，更新库存文件。

    Returns:
        {
          "status": "ok",
          "result": {
            "devices": [{"name":"...", "model":"...", "serial":"...", "kind":"visa|asg", ...}],
            "text": "当前共 N 个设备在线：\n  1. ..."
          }
        }
    """
    online_devices = []
    idn_map = {}

    # ── 1. 读取旧库存（保留用户命名）──
    old_inventory = {}
    try:
        if INVENTORY_PATH.exists():
            old_inventory = json.loads(INVENTORY_PATH.read_text(encoding="utf-8"))
    except Exception:
        pass

    # ── 2. VISA 扫描 ──
    try:
        import pyvisa
        rm = pyvisa.ResourceManager("@py")
        resources = rm.list_resources()

        # 去重：相同前缀取最短地址
        seen_prefix = {}
        for addr in resources:
            prefix = "::".join(addr.split("::")[:4])
            if prefix not in seen_prefix or len(addr) < len(seen_prefix[prefix]):
                seen_prefix[prefix] = addr

        for addr in sorted(seen_prefix.values()):
            try:
                dev = rm.open_resource(addr)
                idn = dev.query("*IDN?").strip()
                dev.close()
            except Exception:
                continue

            parts = [p.strip() for p in idn.split(",")]
            model = parts[1] if len(parts) >= 2 else ""
            serial = parts[2] if len(parts) >= 3 else ""
            if not serial:
                continue

            online_devices.append({
                "model": model,
                "serial": serial,
                "address": addr,
                "name": old_inventory.get(serial, {}).get("name", ""),
                "kind": "visa",
            })
            idn_map[addr] = idn

        rm.close()
    except ImportError:
        pass  # PyVISA 未安装，跳过 VISA 扫描
    except Exception:
        pass

    # ── 3. ASG 扫描 ──
    try:
        import asglib
        init_result = asglib.ASG_Init()
        ok = (isinstance(init_result, dict) and init_result.get("result") == 1) or init_result == 1
        if ok:
            time.sleep(3)  # ASG 初始化后需要等待
            asg_dev = asglib.ASG_GetDevicesList(10)
            if asg_dev.get("result") == 1 and asg_dev.get("count", 0) > 0:
                for item in asg_dev["value"]:
                    dev_name = item.get("asgDev_name", "") or "ASG24100"
                    dev_id = f"{dev_name}{item['asgDev_id']}"
                    online_devices.append({
                        "model": dev_name,
                        "serial": dev_id,
                        "local_ip": item.get("asgDev_localIP", ""),
                        "local_mac": item.get("asgDev_localMAC", ""),
                        "name": old_inventory.get(dev_id, {}).get("name", ""),
                        "kind": "asg",
                    })
            asglib.ASG_Release()
    except ImportError:
        pass  # asglib 未安装，跳过 ASG 扫描
    except Exception:
        pass

    # ── 4. 增量合并：新设备 + 离线设备（保留 name）──
    new_inventory = {}
    for d in online_devices:
        new_inventory[d["serial"]] = {
            "model": d["model"],
            "address": d.get("address", ""),
            "local_ip": d.get("local_ip", ""),
            "local_mac": d.get("local_mac", ""),
            "idn": idn_map.get(d.get("address", ""), ""),
            "name": d["name"],
            "kind": d.get("kind", "visa"),
        }
    # 离线设备：保留旧库存中不在新扫描里的设备（address 清空）
    for serial, info in old_inventory.items():
        if serial not in new_inventory:
            new_inventory[serial] = {
                **info,
                "address": "",
                "local_ip": "",
                "local_mac": "",
                "idn": "",
            }

    # ── 5. 写入库存文件 ──
    try:
        INVENTORY_PATH.parent.mkdir(parents=True, exist_ok=True)
        INVENTORY_PATH.write_text(
            json.dumps(new_inventory, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    except Exception:
        pass  # 文件写入失败不影响扫描结果返回

    # ── 6. 构建返回文本 ──
    if not online_devices:
        text = "当前没有检测到任何已连接的仪器设备。"
    else:
        lines = [f"当前共 {len(online_devices)} 个设备在线："]
        for i, d in enumerate(online_devices, 1):
            label = d["name"] if d["name"] else d["model"]
            lines.append(f"  {i}. {label}")
        text = "\n".join(lines)

    return {
        "status": "ok",
        "result": {
            "devices": online_devices,
            "text": text,
        },
    }
