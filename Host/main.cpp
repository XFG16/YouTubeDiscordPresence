#include "Discord/API/discord.h"
#include <iostream>
#include <fstream>
#include <string>
#include <memory>
#include <thread>
#include <chrono>
#include <ctime>

constexpr int64_t APPLICATION_ID = 847682519214456862;

class DocumentData {
  public:
    std::string title;
    std::string author;
    std::string buffer;
    char temp;
    int stage;
};

std::unique_ptr<discord::Core> core;
int lastTimeLeft = -1;

std::ofstream fout("log.txt");
bool logging = false;

int getSecondsLeft(const std::string& videoTime, const std::string& videoDuration) {
    return 0;
}

void createPresence(void) {
    if (core) {
        return;
    }

    discord::Core* corePtr = nullptr;
    discord::Result result = discord::Core::Create(APPLICATION_ID, DiscordCreateFlags_Default, &corePtr);
    if (logging && result == discord::Result::Ok) {
        fout << "Discord presence has been successfully created" << std::endl;
    }
    else if (logging) {
        fout << "Failed to create Discord presence" << std::endl;
    }
    core.reset(corePtr);
}

void destoryPresence(void) {
    if (!core) {
        return;
    }

    core.reset();
    if (logging && !core) {
        fout << "Discord presence has been destroyed" << std::endl;
    }
    else if (logging) {
        fout << "Failed to destroy Discord presence" << std::endl;
    }
}

void updatePresence(DocumentData& documentData) {
    if (!core && documentData.title != "#*IDLE*#") {
        createPresence();
    }
    else if (documentData.title == "#*IDLE*#") {
        destoryPresence();
        return;
    }

    discord::Activity activity{};
    discord::ActivityTimestamps& timeStamp = activity.GetTimestamps();
    discord::ActivityAssets& activityAssets = activity.GetAssets();

    activity.SetDetails(documentData.title.c_str());
    activity.SetState((std::string("by ") + documentData.author.c_str()).c_str());
    activityAssets.SetLargeImage("youtube2");
    activityAssets.SetLargeText(documentData.title.c_str());
    activityAssets.SetSmallImage("vscodemusic3");
    activityAssets.SetSmallText("YTDP by Michael Ren");

    bool updated;
    core->ActivityManager().UpdateActivity(activity, [&updated](discord::Result result) { updated = true; });
    while(!updated) {
        core->RunCallbacks();
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
    updated = false;

    if (logging) {
        fout << "Received and updated: " << std::endl << "    " << documentData.title << std::endl << "    " << documentData.author << std::endl;
    }
}

bool handleData(DocumentData& documentData) {
    documentData.buffer += documentData.temp;
    if (documentData.stage == 0 && documentData.buffer.find(":TITLE001:") != std::string::npos) {
        ++documentData.stage;
    }
    else if (documentData.stage == 1 && documentData.buffer.find(":AUTHOR002:") == std::string::npos) {
        documentData.title += documentData.temp;
    }
    else if (documentData.stage == 1) {
        documentData.title.resize(documentData.title.size() - 10);
        ++documentData.stage;
    }
    else if (documentData.stage == 2 && documentData.buffer.find(":END003:") == std::string::npos) {
        documentData.author += documentData.temp;
    }
    else if (documentData.stage == 2) {
        documentData.author.resize(documentData.author.size() - 7);
        ++documentData.stage;
    }
    else if (documentData.stage == 3) {
        documentData.buffer.clear();
        documentData.stage = 0;
        return true;
    }
    return false;
}

int main(void) {
    DocumentData documentData;
    documentData.stage = 0;

    while (std::cin >> std::noskipws >> documentData.temp) {
        bool finishedHandling = handleData(documentData);
        if (finishedHandling) {
            updatePresence(documentData);
            documentData.title.clear();
            documentData.author.clear();
        }
    }
}