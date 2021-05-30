#include <unordered_map>
#include <iostream>
#include <fstream>
#include <string>

bool processData(int& processingStage, std::string& dataBuffer,
std::unordered_map<std::string, std::string>& data) {
    if (processingStage == 0) {
        if (dataBuffer.size() >= 9) {
            std::size_t pos = dataBuffer.find("title\":\"");
            if (pos != std::string::npos) {
                ++processingStage;
            }
        }
    }
    else if (processingStage == 1) {
        std::size_t pos = dataBuffer.find("\",\"");
        if (pos != std::string::npos) {
            data["title"].resize(data["title"].size() - 2);
            dataBuffer.clear();
            ++processingStage;
        }
        else {
            data["title"] += dataBuffer.back();
        }
    }
    else if (processingStage == 2) {
        if (dataBuffer.size() >= 14) {
            std::size_t pos = dataBuffer.find("currentTime\":\"");
            if (pos != std::string::npos) {
                ++processingStage;
            }
        }
    }
    else if (processingStage == 3) {
        std::size_t pos = dataBuffer.find("\",\"");
        if (pos != std::string::npos) {
            data["currentTime"].resize(data["currentTime"].size() - 2);
            dataBuffer.clear();
            ++processingStage;
        }
        else {
            data["currentTime"] += dataBuffer.back();
        }
    }
    else if (processingStage == 4) {
        if (dataBuffer.size() >= 11) {
            std::size_t pos = dataBuffer.find("duration\":\"");
            if (pos != std::string::npos) {
                ++processingStage;
            }
        }
    }
    else if (processingStage == 5) {
        std::size_t pos = dataBuffer.find("\",\"");
        if (pos != std::string::npos) {
            data["duration"].resize(data["duration"].size() - 2);
            dataBuffer.clear();
            ++processingStage;
        }
        else {
            data["duration"] += dataBuffer.back();
        }
    }
    else if (processingStage == 6) {
        if (dataBuffer.size() >= 14) {
            std::size_t pos = dataBuffer.find("channelName\":\"");
            if (pos != std::string::npos) {
                ++processingStage;
            }
        }
    }
    else if (processingStage == 7) {
        std::size_t pos = dataBuffer.find("\",\"");
        if (pos != std::string::npos) {
            data["channelName"].resize(data["channelName"].size() - 2);
            dataBuffer.clear();
            ++processingStage;
        }
        else {
            data["channelName"] += dataBuffer.back();
        }
    }
    else if (processingStage == 8) {
        if (dataBuffer.size() >= 15) {
            std::size_t pos = dataBuffer.find("channelImage\":\"");
            if (pos != std::string::npos) {
                ++processingStage;
            }
        }
    }
    else if (processingStage == 9) {
        std::size_t pos = dataBuffer.find("\",\"");
        if (pos != std::string::npos) {
            data["channelImage"].resize(data["channelImage"].size() - 2);
            dataBuffer.clear();
            ++processingStage;
        }
        else {
            data["channelImage"] += dataBuffer.back();
        }
    }
    else if (processingStage == 10) {
        if (dataBuffer.size() >= 14) {
            std::size_t pos = dataBuffer.find("notPlayingAd\":");
            if (pos != std::string::npos) {
                ++processingStage;
            }
        }
    }
    else if (processingStage == 11) {
        std::size_t pos = dataBuffer.find("}");
        if (pos != std::string::npos) {
            dataBuffer.clear();
            processingStage = 0;
            return true;
        }
        else {
            data["notPlayingAd"] += dataBuffer.back();
        }
    }
    return false;
}

int main(void) {
    std::unordered_map<std::string, std::string> data;
    data["title"] = data["currentTime"] = data["duration"] = "";
    data["channelName"] = data["channelImage"] = data["notPlayingAd"] = "";

    std::ofstream fout("log.txt", std::ios_base::app);
    std::string dataBuffer;
    int processStage = 0, count = 0;

    while (true) {
        char ch;
        std::cin >> std::noskipws >> ch;
        dataBuffer += ch;
        if (processData(processStage, dataBuffer, data)) { // true if all data is processed
            fout << "Packet #" << ++count << std::endl;
            fout << data["title"] << std::endl;
            fout << data["currentTime"] << std::endl;
            fout << data["duration"] << std::endl;
            fout << data["channelName"] << std::endl;
            fout << data["channelImage"] << std::endl;
            fout << data["notPlayingAd"] << std::endl << std::endl;
            data["title"] = data["currentTime"] = data["duration"] = "";
            data["channelName"] = data["channelImage"] = data["notPlayingAd"] = "";
        }
    }
}