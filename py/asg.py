"""asglib ASG SDK 引擎 — 批次处理，带连接状态缓存"""
import time

# 连接状态缓存（模块级变量）
_asg_initialized = False


def asg_execute_batch(calls: list, continue_on_error: bool = False) -> dict:
    """
    调用 ASG 设备的多个 SDK 函数，按顺序执行。

    Args:
        calls: 调用列表，每项为 {func, args?, kwargs?, delay?}
        continue_on_error: 出错时是否继续执行后续调用，默认 False

    Returns:
        {"status": "ok", "result": {"results": [...]}}
        {"status": "error", "error": "...", "result": {"results": [...]}}
    """
    if not calls:
        return {"status": "error", "error": "调用列表为空"}

    results = []
    for i, call in enumerate(calls):
        func = call.get("func", "")
        args = call.get("args", [])
        kwargs = call.get("kwargs", {})
        delay = call.get("delay", 0)

        try:
            result = _execute_single(func, args, kwargs, delay)
            results.append(result)
            if not result.get("ok", False) and not continue_on_error:
                results.append({"ok": False, "note": f"[中断] 第 {i + 1} 条调用执行失败，后续调用已跳过"})
                break
        except Exception as e:
            results.append({"ok": False, "error": f"{type(e).__name__}: {e}"})
            if not continue_on_error:
                results.append({"ok": False, "note": f"[中断] 第 {i + 1} 条调用执行失败，后续调用已跳过"})
                break

    all_ok = all(r.get("ok", False) for r in results if "note" not in r)
    return {
        "status": "ok" if all_ok else "error",
        "result": {"results": results},
    }


def _execute_single(func: str, args: list, kwargs: dict, delay: float = 0) -> dict:
    """调用单条 ASG SDK 函数"""
    global _asg_initialized

    try:
        import asglib
    except ImportError:
        return {"ok": False, "error": "asglib 未安装，请安装 ASG SDK"}

    # 延迟初始化（首次调用时）
    if not _asg_initialized:
        try:
            init_result = asglib.ASG_Init()
            ok = (isinstance(init_result, dict) and init_result.get("result") == 1) or init_result == 1
            if not ok:
                return {"ok": False, "error": f"ASG 初始化失败: {init_result}"}
            _asg_initialized = True
        except Exception as e:
            return {"ok": False, "error": f"ASG 初始化异常: {e}"}

    # 查找函数
    func_obj = getattr(asglib, func, None)
    if func_obj is None:
        return {"ok": False, "error": f"函数不存在: {func}"}

    # 调用函数
    try:
        result = func_obj(*args, **kwargs)
        if delay > 0:
            time.sleep(delay)
        return {"ok": True, "result": result}
    except Exception as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}


def asg_release():
    """释放 ASG SDK 资源（可选，进程退出时自动释放）"""
    global _asg_initialized
    try:
        import asglib
        asglib.ASG_Release()
        _asg_initialized = False
    except Exception:
        pass
