// Setup your quiz text and questions here

// NOTE: pay attention to commas, IE struggles with those bad boys

var quizJSON = {
    "info": {
        "name":    "Level 1 Quiz 1!",
        "main":    "<p>Take your time and read the questions carefully</p>",
        "results": "<h5>Results</h5><p>If you ranked in the top 3 levels, than you will advance to the next section. If you ranked Level 4 or 5, you will be redirected to the previous lesson. Good Luck!</p>",
        "level1":  "Level 1 Perfect",
        "level2":  "Level 2 above average",
        "level3":  "Level 3 average",
        "level4":  "Level 4 below average",
        "level5":  "Level 5 fail", // no comma here
        "level6": "Level 6 bombed"
    },
    "questions": [
        { // Question 1 - Multiple Choice, Single True Answer
            "q": "What Arabic letter is equivalent to A in the English alphabet?",
            "a": [
                {"option": "ل",      "correct": false},
                {"option": "ت",     "correct": false},
                {"option": "ا",      "correct": true},
                {"option": "ج",     "correct": false} // no comma here
            ],
            "correct": "<p><span>That's right!</span> The letter Alif ا is equal to the letter A in the English alphabet!</p>",
            "incorrect": "<p><span>No</span> The letter Alif ا is equal to the letter A in the English alphabet!</p>" // no comma here
        },
        { // Question 2 - Multiple Choice, Multiple True Answers, Select Any
            "q": "How many letters are in the Arabic alphabet?",
            "a": [
                {"option": "26",   "correct": false},
                {"option": "28",   "correct": true},
                {"option": "25",   "correct": false},
                {"option": "29", "correct": false} // no comma here
            ],
            "select_any": true,
            "correct": "<p><span>Nice!</span>There are 28 letters in the Arabic alphabet</p>",
            "incorrect": "<p><span>Hmmm.</span> There are 28 letters in the Arabic alphabet</p>" // no comma here
        },
        { // Question 3 - Multiple Choice, Multiple True Answers, Select All
            "q": "Choose the English letter that has no equivalent in the Arabic language.",
            "a": [
                {"option": "P",           "correct": true},
                {"option": "J",                  "correct": false},
                {"option": "Z",  "correct": false},
                {"option": "R",          "correct": false} // no comma here
            ],
            "correct": "<p><span>Brilliant!</span> There are 4 letters that have no equal in Arabic, 'P' is one of them!</p>",
            "incorrect": "<p><span>Not Quite.</span>  There are 4 letters that have no equal in Arabic, P is one of them!</p>"
        },
        { // Question 4
            "q": "Typically, how many forms does a Letter have in Arabic, depending on it's place in a given word?",
            "a": [
                {"option": "1",    "correct": false},
                {"option": "4",     "correct": true},
                {"option": "3",      "correct": false},
                {"option": "2",   "correct": false} // no comma here
            ],
            "correct": "<p><span>Holy bananas!</span> I didn't actually expect you to know that! Correct!</p>",
            "incorrect": "<p><span>Fail.</span> Sorry. There are typically 4 different forms that a letter will have in Arabic.</p>" // no comma here
        },
        { // Question 5
            "q": "Is Arabic a Semitic language?",
            "a": [
                {"option": "Yes",    "correct": true},
                {"option": "No",     "correct": false} // no comma here
            ],
            "correct": "<p><span>Good Job!</span> You must be very observant!</p>",
            "incorrect": "<p><span>ERRRR!</span> Arabic <em>is</em> a Semitic language.</p>" // no comma here
        } // no comma here
    ]
};
