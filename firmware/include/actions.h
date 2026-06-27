/* actions.h — 167/187 动作码表 (据 TSL_REFERENCE §2.2/§2.3)
 * 固件执行器: 167 @0x0800e474 / 187·162 共用 @0x0800c1b2(经查表 0x0800d668)。
 * 每动作的"确切 CAN 帧字节"在这两个执行器内部异步构造(源文档亦注明在固件 switch);
 * 本表枚举全部动作码→语义/目标子系统, 供分发与上层调用; 帧字节级实现回这两个执行器逐项续。*/
#ifndef ACTIONS_H
#define ACTIONS_H
#include <stdint.h>
typedef struct { uint16_t cmd; uint8_t code; const char *name; const char *target; } action_t;
const action_t *action_lookup(uint16_t cmd, uint8_t code);  /* 查不到返回 0 */
int action_count(void);
#endif
