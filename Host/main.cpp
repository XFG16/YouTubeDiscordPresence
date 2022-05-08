#include "Discord/API/discord.h"
#include <iostream>
#include <string>
#include <memory>
#include <ctime>
#include <map>

const int64_t APPLICATION_ID = 847682519214456862;
const std::string TITLE_IDENTIFIER = ":TITLE001:";
const std::string AUTHOR_IDENTIFIER = ":AUTHOR002:";
const std::string TIME_LEFT_IDENTIFIER = ":TIMELEFT003:";
const std::string END_IDENTIFIER = ":END004:";
const std::string IDLE_IDENTIFIER = "#*IDLE*#";
const std::string NULL_AUTHOR = "(%NULL%)";

const bool LOGGING = false;

std::unique_ptr<discord::Core> core;
discord::Activity activity{};
discord::ActivityTimestamps& timeStamp = activity.GetTimestamps();
discord::ActivityAssets& activityAssets = activity.GetAssets();

// CREATE A DISCORD PRESENCE IF ONE DOESN'T ALREADY EXIST

void createPresence(void) {
    if (core) {
        return;
    }

    discord::Core* corePtr = nullptr;
    discord::Result result = discord::Core::Create(APPLICATION_ID, DiscordCreateFlags_Default, &corePtr);
    if (LOGGING && result == discord::Result::Ok) {
        std::cout << "Discord presence has been created" << std::endl;
    }
    else if (LOGGING) {
        std::cout << "Failed to create Discord presence" << std::endl;
    }
    core.reset(corePtr);
}

// DESTROY THE DISCORD PRESENCE IF IT EXISTS

void destoryPresence(void) {
    if (!core) {
        return;
    }

    activity.SetDetails("");
    activity.SetState("");
    timeStamp.SetEnd(0);
    core.reset();
    if (LOGGING && !core) {
        std::cout << "Discord presence has been destroyed" << std::endl;
    }
    else if (LOGGING) {
        std::cout << "Failed to destroy Discord presence" << std::endl;
    }
}

// UPDATE DISCORD PRESENCE WITH DATA

void updatePresence(const std::string& title, const std::string& author, const std::string& timeLeft) {
    if (title == IDLE_IDENTIFIER) {
        destoryPresence();
        return;
    }
    createPresence();

    activity.SetDetails(title.c_str());

    if (author == NULL_AUTHOR) {
        activity.SetState("");
    }
    else {
        activity.SetState(("by " + author).c_str());
    }

    activityAssets.SetLargeImage("youtube3");
    activityAssets.SetLargeText(title.c_str());
    activityAssets.SetSmallImage("vscodemusic3");
    activityAssets.SetSmallText("YouTubeDiscordPresence by 2309#2309");
    timeStamp.SetEnd(std::time(nullptr) + std::stoi(timeLeft));

    core->ActivityManager().UpdateActivity(activity, [](discord::Result result) {});
    core->RunCallbacks();

    if (LOGGING) {
        std::cout << "Received and updated: " << std::endl << "    " << title << std::endl << "    " << author << std::endl << "    " << timeLeft << std::endl;
    }
}

// FORMAT ACTUAL INFORMATION FROM DATA SENT BY EXTENSION

void handleData(const std::string& documentData) {
    int titleLocation = documentData.find(TITLE_IDENTIFIER);
    int authorLocation = documentData.find(AUTHOR_IDENTIFIER);
    int timeLeftLocation = documentData.find(TIME_LEFT_IDENTIFIER);
    int endLocation = documentData.length() - END_IDENTIFIER.length();

    std::string title = documentData.substr(titleLocation + TITLE_IDENTIFIER.length(), authorLocation - (titleLocation + TITLE_IDENTIFIER.length()));
    std::string author = documentData.substr(authorLocation + AUTHOR_IDENTIFIER.length(), timeLeftLocation - (authorLocation + AUTHOR_IDENTIFIER.length()));
    std::string timeLeft = documentData.substr(timeLeftLocation + TIME_LEFT_IDENTIFIER.length(), endLocation - (timeLeftLocation + TIME_LEFT_IDENTIFIER.length()));

    updatePresence(title, author, timeLeft);
}

// PROGRAM ENTRY

int main(void) {
    std::string documentData;
    if (LOGGING) {
        std::cout << "Program initialized" << std::endl;
    }

    char temp;
    while (std::cin >> std::noskipws >> temp) {
        documentData += temp;
        if (documentData.length() >= END_IDENTIFIER.length() && documentData.substr(documentData.length() - END_IDENTIFIER.length(), END_IDENTIFIER.length()) == END_IDENTIFIER) {
            handleData(documentData);
            documentData.clear();
            if (LOGGING) {
                std::cout << "DATA CLEARED" << std::endl;
            }
        }
    }

    return 0;
}

/*// class DocumentData {
//   public:
//     std::string title;
//     std::string author;
//     std::string buffer;
//     std::string timeLeft;
//     char temp = '0';
//     int stage = 0;
// };

// void updatePresence(DocumentData& documentData) {
//     if (documentData.title == "#*IDLE*#") {
//         destoryPresence();
//         return;
//     }
//     createPresence();

//     discord::Activity activity{};
//     discord::ActivityTimestamps& timeStamp = activity.GetTimestamps();
//     discord::ActivityAssets& activityAssets = activity.GetAssets();

//     activity.SetDetails(documentData.title.c_str());

//     auto temp = documentData.author;
//     if (temp == "(%NULL%)") {
//         activity.SetState("");
//     }
//     else {
//         activity.SetState(("by " + temp).c_str());
//     }

//     activityAssets.SetLargeImage("youtube3");
//     activityAssets.SetLargeText(documentData.title.c_str());
//     activityAssets.SetSmallImage("vscodemusic3");
//     activityAssets.SetSmallText("YouTubeDiscordPresence by 2309#2309");
//     timeStamp.SetEnd(std::time(nullptr) + std::stoi(documentData.timeLeft));

//     core->ActivityManager().UpdateActivity(activity, [](discord::Result result) {});
//     core->RunCallbacks();

//     if (LOGGING) {
//         std::cout << "Received and updated: " << std::endl << "    " << documentData.title << std::endl << "    " << documentData.author << std::endl << "    " << documentData.timeLeft << std::endl;
//     }
// }

// bool handleData(DocumentData& documentData) {
//     documentData.buffer += documentData.temp;
//     if (documentData.stage == 0 && documentData.buffer.find(":TITLE001:") != std::string::npos) {
//         ++documentData.stage;
//     }
//     else if (documentData.stage == 1 && documentData.buffer.find(":AUTHOR002:") == std::string::npos) { // subtraction size (eg. - 10) is length of it hovering over the string (12 in this case) - 2
//         documentData.title += documentData.temp;
//     }
//     else if (documentData.stage == 1) {
//         documentData.title.resize(documentData.title.size() - 10);
//         ++documentData.stage;
//     }
//     else if (documentData.stage == 2 && documentData.buffer.find(":TIMELEFT003:") == std::string::npos) {
//         documentData.author += documentData.temp;
//     }
//     else if (documentData.stage == 2) {
//         documentData.author.resize(documentData.author.size() - 12);
//         ++documentData.stage;
//     }
//     else if (documentData.stage == 3 && documentData.buffer.find(":END004:") == std::string::npos) {
//         documentData.timeLeft += documentData.temp;
//     }
//     else if (documentData.stage == 3) {
//         documentData.timeLeft.resize(documentData.timeLeft.size() - 7);
//         ++documentData.stage;
//     }
//     else if (documentData.stage == 4) {
//         documentData.buffer.clear();
//         documentData.stage = 0;
//         return true;
//     }
//     return false;
// }

// int main(void) {
//     DocumentData documentData;
//     documentData.stage = 0;

//     while (std::cin >> std::noskipws >> documentData.temp) {
//         bool finishedHandling = handleData(documentData);
//         if (finishedHandling) {
//             updatePresence(documentData);
//             documentData.title.clear();
//             documentData.author.clear();
//             documentData.timeLeft.clear();
//         }
//     }
// }*/