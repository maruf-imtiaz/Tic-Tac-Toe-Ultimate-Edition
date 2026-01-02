#include <emscripten/bind.h>
#include <string>
#include <vector>
#include <algorithm>

using namespace emscripten;

class TicTacToe {
private:
    char board[9];
    char currentPlayer;

public:
    TicTacToe() {
        reset();
    }

    void reset() {
        for (int i = 0; i < 9; i++) board[i] = ' ';
        currentPlayer = 'X';
    }

    char getCurrentPlayer() {
        return currentPlayer;
    }

    std::string makeMove(int idx) {
        if (idx < 0 || idx > 8 || board[idx] != ' ') return "invalid";

        board[idx] = currentPlayer;
        
        if (checkWin(currentPlayer)) {
            std::string res = "";
            res += currentPlayer;
            res += " wins";
            return res;
        }
        
        if (isBoardFull()) return "draw";

        currentPlayer = (currentPlayer == 'X') ? 'O' : 'X';
        return "continue";
    }

    bool checkWin(char p) {
        int winPatterns[8][3] = {
            {0,1,2}, {3,4,5}, {6,7,8}, // Rows
            {0,3,6}, {1,4,7}, {2,5,8}, // Cols
            {0,4,8}, {2,4,6}           // Diagonals
        };
        for (auto& pat : winPatterns) {
            if (board[pat[0]] == p && board[pat[1]] == p && board[pat[2]] == p) return true;
        }
        return false;
    }

    bool isBoardFull() {
        for (int i = 0; i < 9; i++) if (board[i] == ' ') return false;
        return true;
    }

    int getMoveByLevel(std::string level) {
        if (level == "easy") {
            return getRandomMove();
        } else if (level == "medium") {
            // 50% chance to play smart, 50% random
            return (rand() % 2 == 0) ? minimax(board, 'O').index : getRandomMove();
        } else {
            // Hard - Always use Minimax
            return minimax(board, 'O').index;
        }
    }

    int getRandomMove() {
        std::vector<int> available;
        for(int i=0; i<9; i++) if(board[i] == ' ') available.push_back(i);
        if (available.empty()) return -1;
        return available[rand() % available.size()];
    }

    struct Move { int score; int index; };

    Move minimax(char tempBoard[9], char p) {
        std::vector<int> availSpots;
        for(int i=0; i<9; i++) if(tempBoard[i] == ' ') availSpots.push_back(i);

        // Terminal states for recursion
        if (checkWin('X')) return {-10, -1};
        if (checkWin('O')) return {10, -1};
        if (availSpots.empty()) return {0, -1};

        std::vector<Move> moves;

        for (int i : availSpots) {
            Move move;
            move.index = i;
            tempBoard[i] = p;

            if (p == 'O') {
                move.score = minimax(tempBoard, 'X').score;
            } else {
                move.score = minimax(tempBoard, 'O').score;
            }

            tempBoard[i] = ' '; // Backtrack
            moves.push_back(move);
        }

        // Find the BEST move from the moves vector
        int bestMoveIdx = 0;
        if (p == 'O') {
            int bestScore = -10000;
            for (int i = 0; i < moves.size(); i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMoveIdx = i;
                }
            }
        } else {
            int bestScore = 10000;
            for (int i = 0; i < moves.size(); i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMoveIdx = i;
                }
            }
        }
        return moves[bestMoveIdx]; 
    }
};

EMSCRIPTEN_BINDINGS(tic_tac_toe_module) {
    class_<TicTacToe>("TicTacToe")
        .constructor<>()
        .function("reset", &TicTacToe::reset)
        .function("makeMove", &TicTacToe::makeMove)
        .function("getCurrentPlayer", &TicTacToe::getCurrentPlayer)
        .function("getMoveByLevel", &TicTacToe::getMoveByLevel);
}