/* mdr_port.h — CH32V208 (WCH CH32V20x SDK + CH32V20x_BLE_LIB) 端口层接口
 * 把 ModeMDR 可移植核心(../src) 接到真硬件: bxCAN1 收发 + TMOS 定时器 + BLE 0xA3。
 * 拓扑(实证): 收/发同在 CAN1(0x40006400)。
 */
#ifndef MDR_PORT_H
#define MDR_PORT_H
#include <stdint.h>
#include "tesla_frame.h"

/* 在系统初始化阶段调用一次: 配 CAN1(GPIO/时钟/滤波/中断) + 注册 TMOS 任务 + 启动周期分发。*/
void MDR_Init(void);

/* BLE 写特征值回调里调用; 命令字==0xA3 时把 payload(76B) 交给配置处理。*/
void MDR_OnBleWrite(uint8_t cmd, const uint8_t *payload, uint16_t len);

/* 免打扰时窗时间(秒): 传给 modemdr_dispatch(s)。可由上层依配置设置。*/
void MDR_SetTimeParam(uint8_t seconds);

/* CAN1 RX 中断会自动分发到核心; 若用轮询模式可手动喂帧。*/
void MDR_FeedRxFrame(const tesla_frame_t *f);

#endif
