/* can_dispatch.h — 收帧按 ID 路由到处理器 (固件 decode_dispatch BST 的可插拔等价) */
#ifndef CAN_DISPATCH_H
#define CAN_DISPATCH_H
#include "tesla_frame.h"
typedef void (*can_handler_fn)(const tesla_frame_t *f);
void can_dispatch_reset(void);
int  can_dispatch_register(uint16_t id, can_handler_fn h);  /* 1=ok 0=表满 */
void can_dispatch(const tesla_frame_t *f);                  /* 路由; 未注册则丢弃 */
#endif
