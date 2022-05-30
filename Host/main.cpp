#include "Discord/API/discord.h"
#include <iostream>
#include <cstring>
#include <string>
#include <thread>
#include <chrono>
#include <memory>
#include <ctime>
#include <map>

const int64_t APPLICATION_ID = 847682519214456862;
const std::string TITLE_IDENTIFIER = ":TITLE001:";
const std::string AUTHOR_IDENTIFIER = ":AUTHOR002:";
const std::string TIME_LEFT_IDENTIFIER = ":TIMELEFT003:";
const std::string END_IDENTIFIER = ":END004:";
const std::string IDLE_IDENTIFIER = "#*IDLE*#";
const int LIVESTREAM_TIME_ID = -1;
const int ACTIVITY_BUFFER_SIZE = 1024;

const bool LOGGING = false;

std::unique_ptr<discord::Core> core;
std::time_t elapsedTime = 0;
int previousTimeLeft = 0; // USED FOR SWITCHING TO LIVESTREAM PURPOSES

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

void destroyPresence(void) {
    if (!core) {
        return;
    }

    discord::Core* corePtr = nullptr;
    core.reset(corePtr);
    if (LOGGING && !core) {
        std::cout << "Discord presence has been destroyed" << std::endl;
    }
    else if (LOGGING) {
        std::cout << "Failed to destroy Discord presence" << std::endl;
    }
}

// FORMAT C STRINGS

void formatCString(char* str) { // REMEMBER TO DEAL WITH OTHER SPECIAL CHARACTERS LATER
    int j = 0;
    for (int i = 0; str[i] != '\0'; ++i) {
        if (!(str[i] == '\\' && str[i + 1] == '\"') && !(str[i] == '\\' && str[i + 1] == '\'') && !(str[i] == '\\' && str[i + 1] == '\?') && !(str[i] == '\\' && str[i + 1] == '\\')) {
            str[j] = str[i];
            ++j;
        }
    }
    memset(&str[j], '\0', ACTIVITY_BUFFER_SIZE - j);
}

// UPDATE DISCORD PRESENCE WITH DATA

void updatePresence(const std::string& title, const std::string& author, const std::string& timeLeftStr) {
    if (title == IDLE_IDENTIFIER) {
        previousTimeLeft = 0;
        destroyPresence();
        return;
    }
    createPresence();
    int timeLeft = std::stoi(timeLeftStr);

    discord::Activity activity{};
    discord::ActivityTimestamps& timeStamp = activity.GetTimestamps();
    discord::ActivityAssets& activityAssets = activity.GetAssets();

    char titleCString[ACTIVITY_BUFFER_SIZE], authorCString[ACTIVITY_BUFFER_SIZE];
    memset(authorCString, '\0', sizeof(authorCString));
    memset(titleCString, '\0', sizeof(titleCString));

    strcpy_s(titleCString, ACTIVITY_BUFFER_SIZE, title.c_str());
    if (timeLeft != LIVESTREAM_TIME_ID) {
        strcpy_s(authorCString, ACTIVITY_BUFFER_SIZE, ("by " + author).c_str());
        activityAssets.SetLargeImage("youtube3");
        timeStamp.SetEnd(std::time(nullptr) + timeLeft);
    }
    else {
        if (previousTimeLeft >= 0) {
            elapsedTime = std::time(nullptr);
        }
        strcpy_s(authorCString, ACTIVITY_BUFFER_SIZE, ("[LIVE] on " + author).c_str());
        activityAssets.SetLargeImage("youtubelive1");
        timeStamp.SetStart(elapsedTime);
    }

    formatCString(titleCString);
    formatCString(authorCString);

    activity.SetDetails(titleCString);
    activityAssets.SetLargeText(titleCString);
    activity.SetState(authorCString);
    activityAssets.SetSmallImage("githubmark2");
    activityAssets.SetSmallText("YouTubeDiscordPresence on GitHub by XFG16 (2309#2309)");    

    previousTimeLeft = timeLeft;
    bool presenceUpdated = false, entered = false;
    core->ActivityManager().UpdateActivity(activity, [&presenceUpdated](discord::Result result) {
        presenceUpdated = true;
    });
    while (!presenceUpdated) {
        entered = true;
        core->RunCallbacks();
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
    if (!entered) {
        core->RunCallbacks();
    }

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