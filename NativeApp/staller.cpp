#include <unordered_map>
#include <iostream>
#include <fstream>
#include <string>
#include <chrono>
#include <thread>
#include <limits>

#include "discordAPI/discord.h"

/*using namespace discord;

#define APPLICATION_ID 847682519214456862

Core* core = nullptr;
bool updated = false;*/

std::unordered_map<std::string, std::string> data;
std::string dataBuffer;
int parseStage = 0;

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

/*void updatePresence(void) {
    Result result = Core::Create(APPLICATION_ID, DiscordCreateFlags_Default, &core);
    Activity activity{};
    ActivityTimestamps& timeStamp = activity.GetTimestamps();
    ActivityAssets& activityAssets = activity.GetAssets();

    activity.SetDetails(data["title"].c_str());
    activity.SetState((std::string("by ") + data["author"]).c_str());
    timeStamp.SetStart(std::time(nullptr));    
    activityAssets.SetLargeImage("vscodemusic3");
    activityAssets.SetLargeText(data["title"].c_str());
    activityAssets.SetSmallImage("youtube");
    activityAssets.SetSmallText(data["link"].c_str());

    core->ActivityManager().UpdateActivity(activity, [](Result result) { updated = true; });
    while(!updated) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        core->RunCallbacks();
    }
    updated = false;

    std::this_thread::sleep_for(std::chrono::milliseconds(15000));
}*/

int main(void) {
    data["title"] = data["author"] = data["ad"] = data["link"] = "";
    /*data["title"] = "SCP Secret Laboratory | Melancholy (Remixed/Extended version)";
    data["author"] = "Multiverse Uncle";
    data["noAdv"] = true;
    data["link"] = "https://www.youtube.com/watch?v=uuo8P35GSMA";
    updatePresence();*/
    
    char temp;
    std::ofstream fout("log.txt", std::ios_base::app);
    while (std::cin >> std::noskipws >> temp) {
        fout << temp;
        if (parseData(temp)) {
            fout << '\n' << data["title"] << '\n';
            fout << data["author"] << '\n';
            fout << data["ad"] << '\n';
            fout << data["link"] << "\n\n" << std::flush;
            data["title"] = data["author"] = data["ad"] = data["link"] = "";
        }
    }
    
    return 0;
}

/*std::ofstream fout("log.txt", std::ios_base::app);

bool updated = false;
void func() {
    UserManager& userMan = core->UserManager();
    userMan.GetUser([REDACTED], [](Result res, User user) {
        std::cout << "res=" << (int) res << std::endl;
        std::cout << "UserName=" << user.GetUsername() << std::endl;
        updated = true;
    });
    core->RunCallbacks();
}

std::cout << "create result = " <<  (int) result << std::endl;
    core->SetLogHook(LogLevel::Debug, [](LogLevel level, const char* msg){
        std::cout << "level=" << (int) level << "; msg=" << msg << std::endl;
    });
    
    std::cout << "to update" << std::endl;
    func();
    while(!updated) {
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
        core->RunCallbacks();
    }
    updated = false;*/