/* STUB — NOT the real WCH SDK. Minimal decls so `gcc -fsyntax-only` can check
 * mdr_port_ch32v208.c structure on a host. Real build uses your CH32V20x SDK. */
#ifndef WCH_STUBS_H
#define WCH_STUBS_H
#include <stdint.h>
typedef enum { RESET=0, SET } FlagStatus;
typedef enum { DISABLE=0, ENABLE } FunctionalState;
/* CAN */
typedef struct { void*x; } CAN_TypeDef; extern CAN_TypeDef *CAN1;
typedef struct { uint32_t StdId,ExtId; uint8_t IDE,RTR,DLC,Data[8]; } CanTxMsg;
typedef struct { uint32_t StdId,ExtId; uint8_t IDE,RTR,DLC,Data[8],FMI; } CanRxMsg;
typedef struct { uint16_t CAN_Prescaler; uint8_t CAN_Mode,CAN_SJW,CAN_BS1,CAN_BS2;
  FunctionalState CAN_TTCM,CAN_ABOM,CAN_AWUM,CAN_NART,CAN_RFLM,CAN_TXFP; } CAN_InitTypeDef;
typedef struct { uint16_t CAN_FilterIdHigh,CAN_FilterIdLow,CAN_FilterMaskIdHigh,CAN_FilterMaskIdLow,CAN_FilterFIFOAssignment;
  uint8_t CAN_FilterNumber,CAN_FilterMode,CAN_FilterScale; FunctionalState CAN_FilterActivation; } CAN_FilterInitTypeDef;
enum{CAN_Id_Standard,CAN_RTR_Data,CAN_Mode_Normal,CAN_SJW_1tq,CAN_BS1_8tq,CAN_BS2_7tq,
 CAN_FilterMode_IdMask,CAN_FilterScale_32bit,CAN_Filter_FIFO0,CAN_IT_FMP0,CAN_FIFO0};
uint8_t CAN_Init(CAN_TypeDef*,CAN_InitTypeDef*);
void CAN_FilterInit(CAN_FilterInitTypeDef*);
uint8_t CAN_Transmit(CAN_TypeDef*,CanTxMsg*);
void CAN_Receive(CAN_TypeDef*,uint8_t,CanRxMsg*);
void CAN_ITConfig(CAN_TypeDef*,uint32_t,FunctionalState);
FlagStatus CAN_GetITStatus(CAN_TypeDef*,uint32_t);
void CAN_ClearITPendingBit(CAN_TypeDef*,uint32_t);
/* GPIO/RCC */
typedef struct { void*x; } GPIO_TypeDef; extern GPIO_TypeDef *GPIOB;
typedef struct { uint16_t GPIO_Pin; uint8_t GPIO_Speed,GPIO_Mode; } GPIO_InitTypeDef;
#define GPIO_Pin_8 0x100
#define GPIO_Pin_9 0x200
enum{GPIO_Mode_IPU=0x28,GPIO_Mode_AF_PP=0x18,GPIO_Speed_50MHz=3,GPIO_Remap1_CAN1=0x1e};
void GPIO_Init(GPIO_TypeDef*,GPIO_InitTypeDef*);
void GPIO_PinRemapConfig(uint32_t,FunctionalState);
enum{RCC_APB2Periph_GPIOB,RCC_APB2Periph_AFIO,RCC_APB1Periph_CAN1};
void RCC_APB2PeriphClockCmd(uint32_t,FunctionalState);
void RCC_APB1PeriphClockCmd(uint32_t,FunctionalState);
/* NVIC */
enum{USB_LP_CAN1_RX0_IRQn};
void NVIC_EnableIRQ(int);
/* TMOS */
typedef uint8_t  tmosTaskID; typedef uint16_t tmosEvents;
#define INVALID_TASK_ID 0xFF
#define MS1_TO_SYSTEM_TIME(x) ((x)*1000/625)
typedef tmosEvents (*pTaskEventHandlerFn)(tmosTaskID,tmosEvents);
tmosTaskID TMOS_ProcessEventRegister(pTaskEventHandlerFn);
uint8_t tmos_start_task(tmosTaskID,tmosEvents,uint32_t);
#endif
