CC      ?= cc
CFLAGS  ?= -std=c11 -Wall -Wextra -O2 -Iinclude
CORE     = src/tesla_frame.c src/ble_proto.c src/signal_state.c \
           src/can_dispatch.c src/ble_router.c src/can_tx.c
DECODE   = decode/can_decoders.c
PACK     = src/packer.c
BLE      = src/ble_app.c src/ble_auth.c src/ble_router.c src/ble_proto.c

.PHONY: test clean syntax-check-port
test: build/test_modemdr build/test_framework build/test_decode build/test_packer build/test_ble
	./build/test_modemdr
	./build/test_framework
	./build/test_decode
	./build/test_packer
	./build/test_ble
build/test_modemdr: src/tesla_frame.c src/modemdr.c test/test_modemdr.c | build
	$(CC) $(CFLAGS) $^ -o $@
build/test_framework: $(CORE) test/test_framework.c | build
	$(CC) $(CFLAGS) $^ -o $@
build/test_decode: src/tesla_frame.c src/signal_state.c src/can_dispatch.c $(DECODE) test/test_decode.c | build
	$(CC) $(CFLAGS) $^ -o $@
build/test_packer: src/signal_state.c $(PACK) test/test_packer.c | build
	$(CC) $(CFLAGS) $^ -o $@
build/test_ble: $(BLE) $(PACK) src/signal_state.c src/modemdr.c src/tesla_frame.c test/test_ble.c | build
	$(CC) $(CFLAGS) $^ -o $@
build:
	mkdir -p build
clean:
	rm -rf build

# 端口层语法检查 (假头; 真实编译用本地 WCH SDK)
syntax-check-port:
	$(CC) -fsyntax-only -std=gnu11 -Wall -Wextra -Wno-unused-parameter \
	  -DMDR_ISR_ATTR= -Iinclude -Itest/wch_syntax_stubs port/mdr_port_ch32v208.c \
	  && echo "  port syntax OK (stubbed)"
