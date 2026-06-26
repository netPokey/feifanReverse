/* can_tx.h — 发送门禁 (固件 0x080001d4 默认 LISTEN_ONLY) 单一发送出口 */
#ifndef CAN_TX_H
#define CAN_TX_H
#include "tesla_frame.h"
typedef enum { CAN_TX_LISTEN_ONLY=0, CAN_TX_NORMAL=1 } can_tx_mode_t;
void can_tx_set_mode(can_tx_mode_t m);
can_tx_mode_t can_tx_get_mode(void);
int  can_tx_send(const tesla_frame_t *f);   /* 过门禁; 放行=1 拦截=0 */
#endif
