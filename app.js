/*
bananagrams solver

input:
    string letters
    [string] disallowed_words
output:
    [[char]] solution

program:

[combinator.js] find words that can be made with the letters
if words can be found
    (PLACEMENT) [placer.js] place the longest word on the board
    if there are letters left
        for each row and column on the board
            [matcher.js] find words that could fit
        if words can be found
            GOTO PLACEMENT AND CONTINUE
        if words could not be found
            remove the last placed word from the board
            GOTO PLACEMENT
                if there  are more words that we haven't tried
                    place the next word in the set on the board
                    CONTINUE FROM NEXT LINE
                if there are no more words left to try
                    EXIT (NO SOLUTION)
    if there are no letters left
        EXIT WITH SOLUTION
if no words could be found
    EXIT (NO SOLUTION)
*/