"""asglib ASG SDK 引擎 — 批次处理，生命周期硬编码"""
import time
import os
import shutil

_ASGPARSER_DIR = os.path.join(os.path.dirname(__file__), 'asgparser')
_SCRIPT_SRC = os.path.join(_ASGPARSER_DIR, 'script-main.exe')
_SCRIPT_DST_DIR = os.path.join(os.environ.get('APPDATA', ''), 'asg24100parser')
_SCRIPT_DST = os.path.join(_SCRIPT_DST_DIR, 'script-main.exe')


def _ensure_asgparser_initialized():
    """确保 script-main.exe 已复制到 APPDATA（只执行一次）"""
    if os.path.exists(_SCRIPT_DST):
        return  # 已初始化
    
    if not os.path.exists(_SCRIPT_SRC):
        return  # 源文件不存在，跳过
    
    try:
        os.makedirs(_SCRIPT_DST_DIR, exist_ok=True)
        shutil.copy2(_SCRIPT_SRC, _SCRIPT_DST)
    except Exception as e:
        # 记录错误但不阻塞后续操作
        print(f"asgparser 初始化失败: {e}")


def asg_execute_batch(call_request: dict, continue_on_error: bool = False) -> dict:
    """
    执行 ASG SDK 调用，生命周期（Init/Connect/Disconnect/Release）硬编码。

    Args:
        call_request: {
            "device_name": "ASG241002324070090",
            "local_ip": "192.168.1.100",
            "local_mac": "AA-BB-CC-DD-EE-FF",
            "calls": [
                {"func": "ASG_SetParamInt", "args": ["/Waveform/CompileMode", 1]},
                {"func": "ASG_DownloadWaveformCode", "args": ["w1 = Seq_Gen(H,100,L,4,Loop=10)\ns1 = ASG_SEQ([w1(10)])\nASG_OUT[1] = s1\n"]}
            ]
        }
        continue_on_error: 出错时是否继续执行后续调用，默认 False

    Returns:
        {"status": "ok", "result": {"results": [...]}}
        {"status": "error", "error": "...", "result": {"results": [...]}}
    """
    # 首次使用时确保 asgparser 已初始化
    _ensure_asgparser_initialized()

    device_name = call_request.get("device_name", "")
    local_ip = call_request.get("local_ip", "")
    local_mac = call_request.get("local_mac", "")
    calls = call_request.get("calls", [])

    if not calls:
        return {"status": "error", "error": "调用列表为空"}

    results = []

    # ── 阶段 1：Init（硬编码，循环前）──
    init_result = _execute_single("ASG_Init", [], {}, 3000)
    results.append(init_result)
    if not init_result.get("ok", False):
        return {"status": "error", "result": {"results": results}}

    # ── 阶段 2：Connect（硬编码，循环前）──
    connect_result = _execute_single("ASG_ConnectDevice", [device_name, local_ip, local_mac], {}, 0)
    results.append(connect_result)
    if not connect_result.get("ok", False):
        return {"status": "error", "result": {"results": results}}

    # ── 阶段 3：执行核心操作（循环）──
    for i, call in enumerate(calls):
        func = call.get("func", "")
        args = call.get("args", [])
        kwargs = call.get("kwargs", {})
        delay = call.get("delay", 0)

        try:
            result = _execute_single(func, args, kwargs, delay)
            results.append(result)
            if not result.get("ok", False) and not continue_on_error:
                results.append({"ok": False, "note": f"[中断] 第 {i + 1} 条调用执行失败"})
                break
        except Exception as e:
            results.append({"ok": False, "error": f"{type(e).__name__}: {e}"})
            if not continue_on_error:
                results.append({"ok": False, "note": f"[中断] 第 {i + 1} 条调用执行失败"})
                break

    # ── 阶段 4：Disconnect（硬编码，循环后）──
    disconnect_result = _execute_single("ASG_DisConnectDevice", [device_name], {}, 0)
    results.append(disconnect_result)

    # ── 阶段 5：Release（硬编码，循环后）──
    release_result = _execute_single("ASG_Release", [], {}, 0)
    results.append(release_result)

    all_ok = all(r.get("ok", False) for r in results if "note" not in r)
    return {
        "status": "ok" if all_ok else "error",
        "result": {"results": results},
    }


def _execute_single(func: str, args: list, kwargs: dict, delay: float = 0) -> dict:
    """调用单条 ASG SDK 函数"""
    try:
        import asglib
    except ImportError:
        return {"ok": False, "error": "asglib 未安装，请安装 ASG SDK"}

    func_obj = getattr(asglib, func, None)
    if func_obj is None:
        return {"ok": False, "error": f"函数不存在: {func}"}

    try:
        result = func_obj(*args, **kwargs)
        if delay > 0:
            time.sleep(delay)
        return {"ok": True, "result": result}
    except Exception as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}
