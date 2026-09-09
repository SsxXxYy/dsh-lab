"""一次性脚本入口 — 被 TypeScript 通过 python -m py.<module> 调用"""
import sys
import json


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "error": "用法: python -m py.<module> [JSON_ARGS]"}))
        sys.exit(1)

    module = sys.argv[1]
    args = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}

    try:
        if module == "scan":
            from py.scan import scan_instruments
            result = scan_instruments()
        elif module == "scpi":
            from py.scpi import scpi_execute_batch
            result = scpi_execute_batch(
                args.get("commands", []),
                args.get("continueOnError", False)
            )
        elif module == "asg":
            from py.asg import asg_execute_batch
            result = asg_execute_batch(
                args.get("calls", []),
                args.get("continueOnError", False)
            )
        else:
            result = {"status": "error", "error": f"未知模块: {module}"}
    except Exception as e:
        result = {"status": "error", "error": f"{type(e).__name__}: {e}"}

    print(json.dumps(result, ensure_ascii=True))


if __name__ == "__main__":
    main()
