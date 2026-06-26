#include "can_tx.h"
#include "mdr_hal.h"
static can_tx_mode_t s_mode = CAN_TX_LISTEN_ONLY;
void can_tx_set_mode(can_tx_mode_t m){ s_mode = m; }
can_tx_mode_t can_tx_get_mode(void){ return s_mode; }
int can_tx_send(const tesla_frame_t *f){
    if (s_mode != CAN_TX_NORMAL) return 0;     /* 监听态: 拦截所有发送 */
    mdr_hal_can1_send(f);
    return 1;
}
