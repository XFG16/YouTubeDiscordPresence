// #include "Discord/Raw/discord.h"
#include <iostream>
#include <fstream>
#include <string>

class DocumentData {
  public:
    std::string title;
    std::string author;
    std::string buffer;
    char temp;
    int stage;
};

bool handleData(DocumentData& documentData) {
    documentData.buffer += documentData.temp;
    if (documentData.stage == 0 && documentData.buffer.find(":TITLE001:") != std::string::npos) ++documentData.stage;
    else if (documentData.stage == 1 && documentData.buffer.find(":AUTHOR002:") == std::string::npos) documentData.title += documentData.temp;
    else if (documentData.stage == 1) {
        documentData.title.resize(documentData.title.size() - 10);
        ++documentData.stage;
    }
    else if (documentData.stage == 2 && documentData.buffer.find(":END003:") == std::string::npos) documentData.author += documentData.temp;
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
    std::ofstream fout("log.txt");

    DocumentData documentData;
    documentData.stage = 0;

    while (std::cin >> std::noskipws >> documentData.temp) {
        bool finishedHandling = handleData(documentData);
        if (finishedHandling) {
            fout << documentData.title << " <BY> " << documentData.author << std::endl;
            documentData.title.clear();
            documentData.author.clear();
        }
    }
}