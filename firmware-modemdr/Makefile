# host 测试构建 (与目标 SDK 无关)
CC      ?= cc
CFLAGS  ?= -std=c11 -Wall -Wextra -O2 -Iinclude
SRC      = src/tesla_frame.c src/modemdr.c test/test_modemdr.c

.PHONY: test clean
test: build/test_modemdr
	./build/test_modemdr
build/test_modemdr: $(SRC) | build
	$(CC) $(CFLAGS) $(SRC) -o $@
build:
	mkdir -p build
clean:
	rm -rf build

# 端口层语法检查 (用 test/wch_syntax_stubs 假头; 真实编译用你的 WCH SDK)
.PHONY: syntax-check-port
syntax-check-port:
	$(CC) -fsyntax-only -std=gnu11 -Wall -Wextra -Wno-unused-parameter \
	  -DMDR_ISR_ATTR= -Iinclude -Itest/wch_syntax_stubs port/mdr_port_ch32v208.c \
	  && echo "  port syntax OK (stubbed)"
