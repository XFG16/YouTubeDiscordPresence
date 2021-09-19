#include "Discord/API/discord.h"
#include <iostream>
#include <fstream>
#include <string>
#include <memory>
#include <thread>
#include <chrono>

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
std::ofstream fout("log.txt");

void createPresence(void) {
    if (core) {
        return;
    }

    discord::Core* corePtr = nullptr;
    discord::Result result = discord::Core::Create(APPLICATION_ID, DiscordCreateFlags_Default, &corePtr);
    if (result == discord::Result::Ok) {
        fout << "Discord presence has been successfully created" << std::endl;
    }
    else {
        fout << "Failed to create Discord presence" << std::endl;
    }
    core.reset(corePtr);
}

void updatePresence(DocumentData& documentData) {
    if (!core) {
        return;
    }

    discord::Activity activity{};
    discord::ActivityTimestamps& timeStamp = activity.GetTimestamps();
    discord::ActivityAssets& activityAssets = activity.GetAssets();

    activity.SetDetails(documentData.title.c_str());
    activity.SetState((std::string("by ") + documentData.author.c_str()).c_str());
    activityAssets.SetLargeImage("youtube2");
    activityAssets.SetLargeText("YouTubeDiscordPresence");
    activityAssets.SetSmallImage("vscodemusic3");
    activityAssets.SetSmallText("by Michael Ren");

    bool updated;
    core->ActivityManager().UpdateActivity(activity, [&updated](discord::Result result) { updated = true; });
    while(!updated) {
        core->RunCallbacks();
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
    updated = false;

    fout << "SHOULD HAVE RECEIVED AND UPDATED" << std::endl;
    fout << documentData.title << std::endl;
    fout << documentData.author << std::endl;
}

void destoryPresence(void) {
    if (!core) {
        return;
    }

    core.reset();
    if (core) {
        fout << "Discord presence has been destroyed" << std::endl;
    }
    else {
        fout << "Failed to destroy Discord presence" << std::endl;
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
    createPresence();

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