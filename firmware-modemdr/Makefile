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
