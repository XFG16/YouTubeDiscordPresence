#include <unordered_map>
#include <iostream>
#include <fstream>
#include <string>
#include <chrono>
#include <thread>

/*#include "discordAPI/discord.h"
using namespace discord;

#define APPLICATION_ID 847682519214456862

Core* core = nullptr;
bool updated = false;*/

std::unordered_map<std::string, std::string> data;
std::string dataBuffer;
int parseStage = 0;

bool processData(void) {
    if (parseStage == 0) {
        if (dataBuffer.size() >= 8) {
            std::size_t pos = dataBuffer.find("title\":\"");
            if (pos != std::string::npos) {
                ++parseStage;
            }
        }
    }
    else if (parseStage == 1) {
        std::size_t pos = dataBuffer.find("\",\"");
        if (pos != std::string::npos) {
            data["title"].resize(data["title"].size() - 2);
            dataBuffer.clear();
            ++parseStage;
        }
        else {
            data["title"] += dataBuffer.back();
        }
    }
    else if (parseStage == 2) {
        if (dataBuffer.size() >= 9) {
            std::size_t pos = dataBuffer.find("author\":\"");
            if (pos != std::string::npos) {
                ++parseStage;
            }
        }
    }
    else if (parseStage == 3) {
        std::size_t pos = dataBuffer.find("\",\"");
        if (pos != std::string::npos) {
            data["author"].resize(data["author"].size() - 2);
            dataBuffer.clear();
            ++parseStage;
        }
        else {
            data["author"] += dataBuffer.back();
        }
    }
    else if (parseStage == 4) {
        if (dataBuffer.size() >= 7) {
            std::size_t pos = dataBuffer.find("noAdv\":");
            if (pos != std::string::npos) {
                ++parseStage;
            }
        }
    }
    else if (parseStage == 5) {
        std::size_t pos = dataBuffer.find(",\"");
        if (pos != std::string::npos) {
            data["noAdv"].resize(data["noAdv"].size() - 1);
            dataBuffer.clear();
            ++parseStage;
        }
        else {
            data["noAdv"] += dataBuffer.back();
        }
    }
    else if (parseStage == 6) {
        if (dataBuffer.size() >= 6) {
            std::size_t pos = dataBuffer.find("link\":\"");
            if (pos != std::string::npos) {
                ++parseStage;
            }
        }
    }
    else if (parseStage == 7) {
        std::size_t pos = dataBuffer.find("\"}");
        if (pos != std::string::npos) {
            data["link"].resize(data["link"].size() - 1);
            dataBuffer.clear();
            parseStage = 0;
            return true;
        }
        else {
            data["link"] += dataBuffer.back();
        }
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
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
        core->RunCallbacks();
    }
    updated = false;

    std::this_thread::sleep_for(std::chrono::seconds(150));
}*/

int main(void) {
    data["title"] = data["author"] = data["noAdv"] = data["link"] = "";
    /*data["title"] = "SCP Secret Laboratory | Melancholy (Remixed/Extended version)";
    data["author"] = "Multiverse Uncle";
    data["noAdv"] = true;
    data["link"] = "https://www.youtube.com/watch?v=uuo8P35GSMA";
    updatePresence();*/
    
    std::ofstream fout("log.txt", std::ios_base::app);
    while (true) {
        char ch;
        std::cin >> std::noskipws >> ch;
        dataBuffer += ch;
        if (processData()) { // true if all data is processed
            fout << data["title"] << std::endl;
            fout << data["author"] << std::endl;
            fout << data["noAdv"] << std::endl;
            fout << data["link"] << std::endl << std::endl;
            data["title"] = data["author"] = data["noAdv"] = data["link"] = "";
            // break;
        }
    }

    return 0;
}

/*std::ofstream fout("log.txt", std::ios_base::app);

bool updated = false;
void func() {
    UserManager& userMan = core->UserManager();
    userMan.GetUser(556882673130274817, [](Result res, User user) {
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