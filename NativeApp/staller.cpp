#include <unordered_map>
#include <iostream>
#include <fstream>
#include <string>
#include <chrono>
#include <thread>
#include <limits>
#include <ctime>

#include "discordAPI/discord.h"

#define APPLICATION_ID 847682519214456862

discord::Core* core = nullptr;
bool updated = false;

std::unordered_map<std::string, std::string> data;
std::string dataBuffer;
int parseStage = 0;
time_t lastUpdated = 0;

std::ofstream fout("log.txt", std::ios_base::app);

void initializeResult(void) {
    discord::Result result = discord::Core::Create(APPLICATION_ID, DiscordCreateFlags_Default, &core);
    if (result == discord::Result::Ok) {
        fout << "Result has been successfully initialized" << std::endl;
    }
    else {
        fout << "Result has failed to initialize" << std::endl;
    }
}

bool parseData(char temp) {
    dataBuffer += temp;
    if (parseStage == 0 && dataBuffer.find("*$TITLE%*") != std::string::npos) {
        ++parseStage;
    }
    else if (parseStage == 1 && dataBuffer.find("*$AUTHOR%*") == std::string::npos) {
        data["title"] += dataBuffer.back();
    }
    else if (parseStage == 1) {
        data["title"].resize(data["title"].size() - 9);
        ++parseStage;
    }
    else if (parseStage == 2 && dataBuffer.find("*$AD%*") == std::string::npos) {
        data["author"] += dataBuffer.back();
    }
    else if (parseStage == 2) {
        data["author"].resize(data["author"].size() - 5);
        ++parseStage;
    }
    else if (parseStage == 3 && dataBuffer.find("*$LINK%*") == std::string::npos) {
        data["ad"] += dataBuffer.back();
    }
    else if (parseStage == 3) {
        data["ad"].resize(data["ad"].size() - 7);
        ++parseStage;
    }
    else if (parseStage == 4 && dataBuffer.find("*$END%*") == std::string::npos) {
        data["link"] += dataBuffer.back();
    }
    else if (parseStage == 4) {
        data["link"].resize(data["link"].size() - 6);
        ++parseStage;
    }
    else if (parseStage == 5) {
        dataBuffer.clear();
        parseStage = 0;
        return true;
    }
    return false;
}

void updatePresence(void) {
    if (!core) {
        fout << "Failed to update presence because Discord has not been initialized" << std::endl;
        return;
    }

    discord::Activity activity{};
    discord::ActivityTimestamps& timeStamp = activity.GetTimestamps();
    discord::ActivityAssets& activityAssets = activity.GetAssets();

    activity.SetDetails(data["title"].c_str());
    activity.SetState((std::string("by ") + data["author"]).c_str());
    timeStamp.SetStart(std::time(nullptr));    
    activityAssets.SetLargeImage("vscodemusic3");
    activityAssets.SetLargeText(data["title"].c_str());
    activityAssets.SetSmallImage("youtube");
    activityAssets.SetSmallText(data["link"].c_str());

    core->ActivityManager().UpdateActivity(activity, [](discord::Result result) { updated = true; });
    while(!updated) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        core->RunCallbacks();
    }
    updated = false;

    /*fout << "RECEIVED AND UPDATED" << std::endl;
    fout << data["title"] << std::endl;
    fout << data["author"] << std::endl;
    fout << data["link"] << std::endl << std::endl;*/
}

int main(void) {
    initializeResult();
    data["title"] = data["author"] = data["ad"] = data["link"] = "";
    char temp;

    while (std::cin >> std::noskipws >> temp) {
        if (parseData(temp)) {
            updatePresence();
            data["title"] = data["author"] = data["ad"] = data["link"] = "";
        }
    }
    
    return 0;
}