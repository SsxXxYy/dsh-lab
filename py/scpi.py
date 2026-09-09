"""PyVISA SCPI 命令引擎 — 批次处理，每次新建连接，执行完关闭"""
import time


def scpi_execute_batch(commands: list, continue_on_error: bool = False) -> dict:
    """
    向仪器发送多条 SCPI 命令，按顺序执行。

    Args:
        commands: 命令列表，每项为 {address, command, delay?}
        continue_on_error: 出错时是否继续执行后续命令，默认 False

    Returns:
        {"status": "ok", "result": {"results": [...]}}
        {"status": "error", "error": "...", "result": {"results": [...]}}
    """
    if not commands:
        return {"status": "error", "error": "命令列表为空"}

    results = []
    for i, cmd in enumerate(commands):
        address = cmd.get("address", "")
        command = cmd.get("command", "")
        delay = cmd.get("delay", 0)

        try:
            result = _execute_single(address, command, delay)
            results.append(result)
            if not result.get("ok", False) and not continue_on_error:
                results.append({"ok": False, "note": f"[中断] 第 {i + 1} 条命令执行失败，后续命令已跳过"})
                break
        except Exception as e:
            results.append({"ok": False, "error": f"{type(e).__name__}: {e}"})
            if not continue_on_error:
                results.append({"ok": False, "note": f"[中断] 第 {i + 1} 条命令执行失败，后续命令已跳过"})
                break

    all_ok = all(r.get("ok", False) for r in results if "note" not in r)
    return {
        "status": "ok" if all_ok else "error",
        "result": {"results": results},
    }


def _execute_single(address: str, command: str, delay: float = 0) -> dict:
    """发送单条 SCPI 命令"""
    try:
        import pyvisa
    except ImportError:
        return {"ok": False, "error": "PyVISA 未安装，请运行 pip install pyvisa pyvisa-py"}

    rm = None
    dev = None
    try:
        rm = pyvisa.ResourceManager("@py")
        dev = rm.open_resource(address)
        dev.timeout = 5000  # 5 秒超时

        if command.endswith("?"):
            # 查询命令：返回仪器响应
            response = dev.query(command).strip()
            return {"ok": True, "response": response}
        else:
            # 写入命令：执行后可选延迟
            dev.write(command)
            if delay > 0:
                time.sleep(delay)
            return {"ok": True, "written": True}

    except pyvisa.VisaIOError as e:
        return {"ok": False, "error": f"VISA 错误: {e.description or str(e)}"}
    except Exception as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}
    finally:
        # 确保连接关闭（即使出错）
        if dev is not None:
            try:
                dev.close()
            except Exception:
                pass
        if rm is not None:
            try:
                rm.close()
            except Exception:
                pass
