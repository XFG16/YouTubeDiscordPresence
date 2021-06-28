IDIR =./discordAPI
CC=g++
CFLAGS=-std=c++17 -DDEBUG -g -I$(IDIR)

ODIR=obj
LDIR =./lib

LIBS=-L$(LDIR) -lm -ldiscord_game_sdk

_DEPS = core.h
DEPS = $(patsubst %,$(IDIR)/%,$(_DEPS))

_OBJ = core.o achievement_manager.o activity_manager.o application_manager.o image_manager.o lobby_manager.o network_manager.o overlay_manager.o relationship_manager.o storage_manager.o store_manager.o types.o user_manager.o voice_manager.o
OBJ = $(patsubst %,$(ODIR)/%,$(_OBJ))

$(ODIR)/%.o: $(IDIR)/%.cpp $(DEPS)
	$(CC) -c -o $@ $< $(CFLAGS)

_STALLER_OBJ = staller.o
STALLER_OBJ = $(ODIR)/staller.o
$(STALLER_OBJ)/: staller.cpp $(DEPS)
	$(CC) -c -o $@ $< $(CFLAGS)


staller: $(OBJ) $(STALLER_OBJ)
	$(CC) -o $@ ./lib/discord_game_sdk.dylib $^ $(CFLAGS) -rpath ./lib

.PHONY: clean

clean:
	rm -f $(ODIR)/*.o *~ core $(INCDIR)/*~ 