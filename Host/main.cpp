#include "Discord/API/discord.h"
#include <iostream>
#include <fstream>
#include <string>
#include <memory>
#include <ctime>

constexpr int64_t APPLICATION_ID = 847682519214456862;

class DocumentData {
  public:
    std::string title;
    std::string author;
    std::string buffer;
    std::string timeLeft;
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
        fout << "Discord presence has been created" << std::endl;
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
    if (documentData.title == "#*IDLE*#") {
        destoryPresence();
        return;
    }
    createPresence();

    discord::Activity activity{};
    discord::ActivityTimestamps& timeStamp = activity.GetTimestamps();
    discord::ActivityAssets& activityAssets = activity.GetAssets();

    activity.SetDetails(documentData.title.c_str());
    activity.SetState((std::string("by ") + documentData.author.c_str()).c_str());
    activityAssets.SetLargeImage("youtube3");
    activityAssets.SetLargeText(documentData.title.c_str());
    activityAssets.SetSmallImage("vscodemusic3");
    activityAssets.SetSmallText("YouTubeDiscordPresence by 2309#2309");
    timeStamp.SetEnd(std::time(nullptr) + std::stoi(documentData.timeLeft));

    core->ActivityManager().UpdateActivity(activity, [](discord::Result result) {});
    core->RunCallbacks();

    if (logging) {
        fout << "Received and updated: " << std::endl << "    " << documentData.title << std::endl << "    " << documentData.author << std::endl << "    " << documentData.timeLeft << std::endl;
    }
}

bool handleData(DocumentData& documentData) {
    documentData.buffer += documentData.temp;
    if (documentData.stage == 0 && documentData.buffer.find(":TITLE001:") != std::string::npos) {
        ++documentData.stage;
    }
    else if (documentData.stage == 1 && documentData.buffer.find(":AUTHOR002:") == std::string::npos) { // subtraction size (eg. - 10) is length of it hovering over the string (12 in this case) - 2
        documentData.title += documentData.temp;
    }
    else if (documentData.stage == 1) {
        documentData.title.resize(documentData.title.size() - 10);
        ++documentData.stage;
    }
    else if (documentData.stage == 2 && documentData.buffer.find(":TIMELEFT003:") == std::string::npos) {
        documentData.author += documentData.temp;
    }
    else if (documentData.stage == 2) {
        documentData.author.resize(documentData.author.size() - 12);
        ++documentData.stage;
    }
    else if (documentData.stage == 3 && documentData.buffer.find(":END004:") == std::string::npos) {
        documentData.timeLeft += documentData.temp;
    }
    else if (documentData.stage == 3) {
        documentData.timeLeft.resize(documentData.timeLeft.size() - 7);
        ++documentData.stage;
    }
    else if (documentData.stage == 4) {
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
            documentData.timeLeft.clear();
        }
    }
}