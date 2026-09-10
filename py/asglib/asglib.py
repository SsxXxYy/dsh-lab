#！/usr/bin/env python
from ctypes import *
from enum import Enum
import os
import time
import platform

__all__ = [
    "ASG_Init",
    "ASG_Release",
    "ASG_GetErrorInfo",
    "ASG_GetDevicesList",
    "ASG_ConnectDevice",
    "ASG_DisConnectDevice",
    "ASG_ResetDevice",
    "ASG_GetAllParameters",
    "ASG_SetParamInt",
    "ASG_SetParamFloat",
    "ASG_GetParamInt",
    "ASG_GetParamFloat",
    "ASG_GetChannelLight",
    "ASG_GetChildCardStates",
    "ASG_GetCounterValue",
    "ASG_GetCounterValue_ALL",
    "ASG_DealUpdateFirmware",
    "ASG_GetUpdateFirwareProgress",
    "ASG_DownloadWaveformCode"
]



#全局变量so句柄
dirname,filename = os.path.split(os.path.abspath(__file__))
arch = platform.architecture()[0]
if arch == "64bit":
    dll_obj = CDLL(os.path.join(dirname, R'x64/ASG24100_SDK_x64'))
else:
    dll_obj = CDLL(os.path.join(dirname, R'Win32/ASG24100_SDK_Win32'))

# ************************************
#  Method:    ASG_Init SDK初始化
#  Returns:   result 执行结果，成功为1，其他失败；version 返回SDK版本号
#  Mark:      执行SDK其它功能前必须先进行此操作
# ***********************************
def ASG_Init()-> dict:
    tempInfo = (c_char*10)()
    result = dll_obj.ASG_Init(tempInfo)
    version = (tempInfo.value).decode('utf-8')
    return {"result": result, "version": version}

# ************************************
#  Method:    ASG_Release SDK资源释放
#  Returns:   result 执行结果，成功为1，其他失败
#  Mark:      关闭软件前进行此操作
# ***********************************
def ASG_Release()->int:
    result = dll_obj.ASG_Release()
    return result

# ************************************
#  Method:    ASG_GetErrorInfo 根据错误代码获取具体错误信息
#  Returns:   错误信息
#  Mark:      执行指令若出现错误返回，可根据此接口获取错误信息
# ***********************************
def ASG_GetErrorInfo(code) -> str:
    dll_obj.ASG_GetErrorInfo.restype = c_char_p
    err_str = dll_obj.ASG_GetErrorInfo(code)
    err_str = err_str.decode('utf-8')
    return err_str

#获取设备列表
class ASGDevInfo(Structure):
    _fields_ = [
        ("asgDev_name",          c_char * 10),
        ("asgDev_id",         c_char * 15),
        ("asgDev_hardV",        c_char * 8),
        ("asgDev_firmV",          c_char * 8),

        ("asgDev_devIP",         c_char * 16),
        ("asgDev_devMAC",        c_char * 18),
        ("asgDev_localIP",       c_char * 16),
        ("asgDev_localMAC",        c_char * 18),

        ("asgDev_dsp", c_char * 64),
        ("asgDev_connectType", c_int),  #0:USB,1:TCP,2:UDP,3:SUDP
    ] 

class ASGParameter(Structure):
    _fields_ = [
        ("asgCmd", c_char*40),
        ("value", c_uint32),
    ]

class CounterValueStruct(Structure):
    _fields_ = [
        ("str_device_name", c_char*40),
        ("counter_id", c_int),
        ("counter_value", c_uint*4000),
        ("counter_size", c_int),
    ]

# ************************************
#  Method:    ASG_GetDevicesList 获取设备列表
#  Returns:   result 执行结果，成功为1，其他失败；count 实际搜索到的设备数量；value 设备列表
#  Parameter: nums 限定一次可搜索到最大设备数量，默认5
# ***********************************
def ASG_GetDevicesList(nums = 5) -> dict:
    ASGDevices_Array = ASGDevInfo*nums
    ASGDevices_Array_Pointer = POINTER(ASGDevices_Array)

    buffer = ASGDevices_Array()
    p_buffer = ASGDevices_Array_Pointer(buffer)
    count = dll_obj.ASG_GetDeviceList(p_buffer,nums)
    if count < 0:
        print("Get Device list failed. SDK may be uninitialized or failed to initialize!")
        return {"result": count}
    all_devices = list()
    for item in range(count):
        one_device = dict()
        one_device["asgDev_name"] = str(buffer[item].asgDev_name,'utf-8')
        one_device["asgDev_id"] = str(buffer[item].asgDev_id,'utf-8')
        one_device["asgDev_hardV"] = str(buffer[item].asgDev_hardV,'utf-8')
        one_device["asgDev_firmV"] = str(buffer[item].asgDev_firmV,'utf-8')

        one_device["asgDev_devIP"] = str(buffer[item].asgDev_devIP,'utf-8')
        one_device["asgDev_devMAC"] = str(buffer[item].asgDev_devMAC,'utf-8')
        one_device["asgDev_localIP"] = str(buffer[item].asgDev_localIP,'utf-8')
        one_device["asgDev_localMAC"] = str(buffer[item].asgDev_localMAC,'utf-8')

        one_device["asgDev_dsp"] = str(buffer[item].asgDev_dsp,'utf-8')
        one_device["asgDev_connectType"] = buffer[item].asgDev_connectType
        all_devices.append(one_device)
    return {"result": 1, "count": count, "value": all_devices}


# ************************************
#  Method:    ASG_ConnectDevice 连接设备
#  Returns:   result 执行结果，成功为1，其他失败
#  Parameter: str_device_name "ASG24100"+由ASG_GetDevicesList函数获取的设备编号
#  Mark:      连接设备后，SDK将主动同步设备数据，需做1-2s左右延时操作
# ***********************************
def ASG_ConnectDevice(str_device_name, local_ip, local_mac) -> int:
    p_dev_name = c_char_p(str_device_name.encode('utf-8'))
    p_local_ip = c_char_p(local_ip.encode('utf-8'))
    p_local_mac = c_char_p(local_mac.encode('utf-8'))

    result = dll_obj.ASG_ConnectDevice(p_dev_name,p_local_ip,p_local_mac)
    time.sleep(2)
    return result


# ************************************
#  Method:    ASG_DisConnectDevice 断开连接
#  Returns:   result 执行结果，成功为1，其他失败
#  Parameter: str_device_name "ASG24100"+由ASG_GetDevicesList函数获取的设备编号
# ***********************************
def ASG_DisConnectDevice(str_device_name) -> int:
    p_dev_name = c_char_p(str_device_name.encode('utf-8'))
    result = dll_obj.ASG_DisConnectDevice(p_dev_name)
    return result

# ************************************
#  Method:    ASG_ResetDevice 重置设备
#  Returns:   result 执行结果，成功为1，其他失败
#  Parameter: str_device_name "ASG24100"+由ASG_GetDevicesList函数获取的设备编号
# ***********************************
def ASG_ResetDevice(str_device_name) -> int:
    p_dev_name = c_char_p(str_device_name.encode('utf-8'))
    result = dll_obj.ASG_ResetDevice(p_dev_name)
    return result

# ************************************
#  Method:    ASG_GetAllParameters 获取设备所有参数
#  Returns:   result 执行结果，成功为1，其他失败；count 实际需同步寄存器数量；all_parameters 所有参数信息，指令+数值
#  Parameter: str_device_name "ASG24100"+由ASG_GetDevicesList函数获取的设备编号
# ***********************************
def ASG_GetAllParameters(str_device_name) -> dict:
    p_dev_name = c_char_p(str_device_name.encode('utf-8'))
    ASGAllParameters_Array = ASGParameter*200
    ASGAllParameters_Pointer = POINTER(ASGAllParameters_Array)

    buffer = ASGAllParameters_Array()
    p_buffer = ASGAllParameters_Pointer(buffer)
    count = dll_obj.ASG_GetAllParameters(p_dev_name,p_buffer)
    if(count < 0):
        print("Get Parameters failed. !")
        return {"result":count}
    all_parameters = list()
    for item in range(count):
        one_parameter = dict()
        one_parameter["asgCmd"] = str(buffer[item].asgCmd,'utf-8')
        one_parameter["value"] = buffer[item].value
        all_parameters.append(one_parameter)
    return {"result": 1, "count": count, "value": all_parameters}

c_uint_p = POINTER(c_uint)
c_double_p = POINTER(c_double)
c_int_p = POINTER(c_int)

# ************************************
#  Method:    ASG_SetParamInt 设置参数（整型）
#  Returns:   result 执行结果，成功为1，其他失败
#  Parameter: str_device_name "ASG24100"+由ASG_GetDevicesList函数获取的设备编号
#  Parameter: str_cmd 对应的功能指令
#  Parameter: value 待设置的数值
# ***********************************
def ASG_SetParamInt(str_device_name, str_cmd, value) -> int:
    p_dev_name = c_char_p(str_device_name.encode('utf-8'))
    p_cmd = c_char_p(str_cmd.encode('utf-8'))

    result = dll_obj.ASG_SetParamInt(p_dev_name, p_cmd, value)
    return result


# ************************************
#  Method:    ASG_SetParamFloat 设置参数（浮点型）
#  Returns:   result 执行结果，成功为1，其他失败
#  Parameter: str_device_name "ASG24100"+由ASG_GetDevicesList函数获取的设备编号
#  Parameter: str_cmd 对应的功能指令
#  Parameter: value 待设置的数值
# ***********************************
def ASG_SetParamFloat(str_device_name, str_cmd, value) -> int:
    p_dev_name = c_char_p(str_device_name.encode('utf-8'))
    p_cmd = c_char_p(str_cmd.encode('utf-8'))
    result = dll_obj.ASG_SetParamFloat(p_dev_name, p_cmd, c_double(value))
    return result


# ************************************
# Method:    ASG_GetParamInt 获取参数（整型）
# Returns:   result 执行结果，成功为1，其他失败；value 读取到的数据
# Parameter: str_device_name "ASG24100"+由ASG_GetDevicesList函数获取的设备编号
# Parameter: str_cmd 对应的功能指令
# ************************************
def ASG_GetParamInt(str_device_name, str_cmd) -> dict:
    p_dev_name = c_char_p(str_device_name.encode('utf-8'))
    p_cmd = c_char_p(str_cmd.encode('utf-8'))
    value = c_int()

    result = dll_obj.ASG_GetParamInt(p_dev_name, p_cmd, c_int_p(value))
    if result != 1:
        value = None
    return {"result": result, "value": value.value}

# ************************************
# Method:    ASG_GetParamFloat 获取参数（浮点型）
# Returns:   result 执行结果，成功为1，其他失败；value 读取到的数据
# Parameter: str_device_name "ASG24100"+由ASG_GetDevicesList函数获取的设备编号
# Parameter: str_cmd 对应的功能指令
# ************************************
def ASG_GetParamFloat(str_device_name, str_cmd) -> dict:
    p_dev_name = c_char_p(str_device_name.encode('utf-8'))
    p_cmd = c_char_p(str_cmd.encode('utf-8'))
    value = c_double()

    result = dll_obj.ASG_GetParamFloat(p_dev_name, p_cmd, c_double_p(value))
    if result != 1:
        value = None
    return {"result": result, "value": value.value}

# ************************************
# Method:    ASG_GetChannelLight 获取通道状态灯数据
# Returns:   result 执行结果，成功为1，其他失败；
#            value 对应24个通道的灯状态，0暗，1亮，(示例：[1,0,0,0,0,0,0,0,...])
# Parameter: str_device_name "ASG24100"+由ASG_GetDevicesList函数获取的设备编号
# ************************************
def ASG_GetChannelLight(str_device_name) -> dict:
    p_dev_name = c_char_p(str_device_name.encode('utf-8'))
    int_arr_temp = c_int*24
    int_arr = int_arr_temp()
    result_value = list()

    result = dll_obj.ASG_GetChannelLight(p_dev_name, byref(int_arr))
    if result == 1:
        result_value = list(int_arr)
    return {"result": result, "value": result_value}

# ************************************
# Method:    ASG_GetChildCardStates 获取通道状态灯数据
# Returns:   result 执行结果，成功为1，其他失败；
#            value 对应6个子卡连接状态，0未连接，1已连接 (示例：[1,0,0,0,0,0])
# Parameter: str_device_name "ASG24100"+由ASG_GetDevicesList函数获取的设备编号
# ************************************
def ASG_GetChildCardStates(str_device_name) -> dict:
    p_dev_name = c_char_p(str_device_name.encode('utf-8'))
    int_arr_temp = c_int*6
    int_arr = int_arr_temp()
    result_value = list()
    result = dll_obj.ASG_GetChildCardStates(p_dev_name, byref(int_arr))
    if result == 1:
        result_value = list(int_arr)
    return {"result": result, "value": result_value}

# ************************************
# Method:    ASG_GetCounterValue 获取外部输入对应的Counter数据
# Returns:   result 执行结果，成功为1，其他失败；size 实际返回counter个数；value 对应size个数的counter值
# Parameter: str_device_name "ASG24100"+由ASG_GetDevicesList函数获取的设备编号
# Parameter: int_counter_id，1-4
# ************************************
def ASG_GetCounterValue(str_device_name, int_counter_id) -> dict:
    p_dev_name = c_char_p(str_device_name.encode('utf-8'))

    value_r = (c_uint*4000)()
    length = c_int()
    result_value = []

    result = dll_obj.ASG_GetCounterValue(p_dev_name, c_int(int_counter_id), value_r, c_int_p(length))
    if result == 1:
        for i in range(length.value):
            result_value.append(value_r[i])
        return {"result": result, "size": length.value, "value": result_value}
    else:
        return {"result": result}

# ************************************
# Method:    ASG_GetCounterValue_ALL 同时获取4个Counter数据
# Returns:   result 执行结果，成功为1，其他失败；value 对应4个Counter输出通道数据size个数的counter值
# Parameter: str_device_name "ASG24100"+由ASG_GetDevicesList函数获取的设备编号
# ************************************
def ASG_GetCounterValue_ALL(str_device_name) -> dict:
    p_dev_name = c_char_p(str_device_name.encode('utf-8'))
    CounterValue_Array = CounterValueStruct * 4
    CounterValue_Array_Pointer = POINTER(CounterValue_Array)

    buffer = CounterValue_Array()
    p_buffer = CounterValue_Array_Pointer(buffer)
    ret = dll_obj.ASG_GetCounterValue_ALL(p_dev_name, p_buffer)
    if (ret < 0):
        print("Get Device list failed. SDK may be uninitialized or failed to initialize!")
        return {"result": ret}
    all_counterV = list()
    for item in range(4):
        one_counterV = dict()
        result_value = []
        one_counterV["counter_id"] = buffer[item].counter_id
        one_counterV["counter_size"] = buffer[item].counter_size
        one_counterV["str_device_name"] = str(buffer[item].str_device_name, 'utf-8')
        for i in range(buffer[item].counter_size):
            result_value.append(buffer[item].counter_value[i])
        one_counterV["counter_value"] = result_value
        all_counterV.append(one_counterV)
    return {"result": 1, "value": all_counterV}


# ************************************
# Method:    ASG_DealUpdateFirmware 固件升级
# Returns:   result 执行结果（只表示该指令下发成功），成功为1，其他失败；
# Parameter: str_device_name "ASG24100"+由ASG_GetDevicesList函数获取的设备编号
#            str_file_path 固件绝对路径
# ************************************
def ASG_DealUpdateFirmware(str_device_name, str_file_path) -> int:
    p_dev_name = c_char_p(str_device_name.encode('utf-8'))
    p_dev_path = c_char_p(str_file_path.encode('utf-8'))
    ret = dll_obj.ASG_DealUpdateFirmware(p_dev_name, p_dev_path)
    return ret

# ************************************
# Method:    ASG_GetUpdateFirwareProgress 获取固件升级进度
# Returns:   result 执行结果（只表示该指令下发成功），成功为1，其他失败； value 进度值
# Parameter: str_device_name "ASG24100"+由ASG_GetDevicesList函数获取的设备编号
# ************************************
def ASG_GetUpdateFirwareProgress(str_device_name) -> dict:
    p_dev_name = c_char_p(str_device_name.encode('utf-8'))
    value = c_int()
    result = dll_obj.ASG_GetUpdateFirwareProgress(p_dev_name, c_int_p(value))
    if result != 1:
        value = None
    return {"result": result, "value": value.value}


# ************************************
# Method:    ASG_DownloadWaveformCode 下载波形代码
# Returns:   result 执行结果（只表示该指令下发成功），成功为1，其他失败；
# Parameter: str_device_name "ASG24100"+由ASG_GetDevicesList函数获取的设备编号
#            waveform_code 波形代码
# ************************************
def ASG_DownloadWaveformCode(str_device_id, waveform_code) -> int:
    p_dev_id = c_char_p(str_device_id.encode('utf-8'))
    p_waveform_code = c_char_p(waveform_code.encode('utf-8'))

    ret = dll_obj.ASG_DownloadWaveformCode(p_dev_id, p_waveform_code)
    return ret











