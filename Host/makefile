IDIR =./Discord/API
CC=g++
CFLAGS=-std=c++17 -DDEBUG -g -I$(IDIR)

ODIR =./Discord/Compiled
LDIR =./Discord/Lib

LIBS=-L$(LDIR) -lm -ldiscord_game_sdk

_DEPS = core.h
DEPS = $(patsubst %,$(IDIR)/%,$(_DEPS))

_OBJ = core.o achievement_manager.o activity_manager.o application_manager.o image_manager.o lobby_manager.o network_manager.o overlay_manager.o relationship_manager.o storage_manager.o store_manager.o types.o user_manager.o voice_manager.o
OBJ = $(patsubst %,$(ODIR)/%,$(_OBJ))

$(ODIR)/%.o: $(IDIR)/%.cpp $(DEPS)
	$(CC) -c -o $@ $< $(CFLAGS)

_MAIN_OBJ = main.o
MAIN_OBJ = $(ODIR)/main.o
$(MAIN_OBJ)/: main.cpp $(DEPS)
	$(CC) -c -o $@ $< $(CFLAGS)


main: $(OBJ) $(MAIN_OBJ)
	$(CC) -o $@ ./Discord/Lib/discord_game_sdk.dylib $^ $(CFLAGS) -rpath ./Discord/Lib

.PHONY: clean

clean:
	rm -f $(ODIR)/*.o *~ core $(INCDIR)/*~ 