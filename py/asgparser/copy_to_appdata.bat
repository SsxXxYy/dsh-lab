@echo off
setlocal

rem 设置源文件夹和目标文件夹
set "source_file=%cd%\script-main.exe"
set "target_folder=%APPDATA%\asg24100parser"

rem 如果目标文件夹不存在，则创建它
if not exist "%target_folder%" (
    mkdir "%target_folder%"
)

rem 拷贝源文件夹到目标文件夹
xcopy /Y "%source_file%" "%target_folder%"

echo Copy completed.
pause
