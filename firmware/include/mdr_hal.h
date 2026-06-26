/* mdr_hal.h — 平台抽象层 (Hardware Abstraction Layer)
 * ModeMDR 业务逻辑与硬件解耦; 在 CH32V208 上用 WCH SDK 实现这些 hook,
 * 在 host 测试里用 fake 实现。对应固件:
 *   mdr_hal_can1_send  -> 0x0800aaa0 -> CAN_Transmit(0x40006400)   (固件 @0x08010d6c)
 *   mdr_hal_schedule   -> 软件定时器 (固件 @0x08001124, TMOS 风格)
 */
#ifndef MDR_HAL_H
#define MDR_HAL_H
#include "tesla_frame.h"

/* 在 CAN1 上发送(回注)一帧。*/
void mdr_hal_can1_send(const tesla_frame_t *f);

/* 调度一次性回调, delay_ms 毫秒后触发 (用于无感激活时窗清零)。*/
typedef void (*mdr_task_cb)(void);
void mdr_hal_schedule(mdr_task_cb cb, uint32_t delay_ms);

#endif
