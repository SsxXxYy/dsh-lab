"""一次性脚本入口 — 被 TypeScript 通过 python -m py.<module> 调用"""
import sys
import json


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "error": "用法: python -m py.<module>"}))
        sys.exit(1)

    module = sys.argv[1]
    # 从 stdin 读取参数 JSON，避免命令行引号转义问题
    raw = sys.stdin.read()
    args = json.loads(raw) if raw.strip() else {}

    try:
        if module == "scan":
            from py.scan import scan_instruments
            result = scan_instruments(args.get("workspaceRoot", ""))
        elif module == "scpi":
            from py.scpi import scpi_execute_batch
            result = scpi_execute_batch(
                args.get("commands", []),
                args.get("continueOnError", False)
            )
        elif module == "asg":
            from py.asg import asg_execute_batch
            result = asg_execute_batch(args)
        else:
            result = {"status": "error", "error": f"未知模块: {module}"}
    except Exception as e:
        result = {"status": "error", "error": f"{type(e).__name__}: {e}"}

    print(json.dumps(result, ensure_ascii=True))


if __name__ == "__main__":
    main()
