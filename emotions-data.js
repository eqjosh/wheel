const emotionsData = {
    'joy-1-optimistic': {
        name: 'Optimistic',
        category: 'Joy',
        color: '#ffcb09',
        description: 'A feeling of hopefulness and confidence about the future. When you\'re optimistic, you believe that good things will happen and maintain a positive outlook on life.',
        relatedFeelings: ['Positive', 'Inspired', 'Hopeful']
    },
    'joy-2-confident': {
        name: 'Confident',
        category: 'Joy',
        color: '#ffcb09',
        description: 'A sense of self-assurance arising from appreciation of your abilities or qualities. Confidence empowers you to take action and face challenges.',
        relatedFeelings: ['Proud', 'Self-assured', 'Empowered']
    },
    'joy-3-joyful': {
        name: 'Joyful',
        category: 'Joy',
        color: '#ffcb09',
        description: 'A feeling of great pleasure and happiness. Pure joy is an intense, positive emotion that fills you with delight and contentment.',
        relatedFeelings: ['Ecstatic', 'Delighted', 'Blissful']
    },
    'joy-4-loving': {
        name: 'Loving',
        category: 'Joy',
        color: '#ffcb09',
        description: 'A deep feeling of affection, care, and warmth toward someone or something. Love creates connection and a sense of belonging.',
        relatedFeelings: ['Embracing', 'Generous', 'Affectionate']
    },
    'trust-1-grateful': {
        name: 'Grateful',
        category: 'Trust',
        color: '#89c24f',
        description: 'A warm feeling of thankfulness and appreciation. Gratitude helps you recognize and value the good things in your life.',
        relatedFeelings: ['Fulfilled', 'Admiration', 'Thankful']
    },
    'trust-2-peaceful': {
        name: 'Peaceful',
        category: 'Trust',
        color: '#89c24f',
        description: 'A state of tranquility and calm, free from worry or disturbance. Peace brings mental and emotional equilibrium.',
        relatedFeelings: ['Calm', 'Content', 'Serene']
    },
    'trust-3-accepted': {
        name: 'Accepted',
        category: 'Trust',
        color: '#89c24f',
        description: 'A feeling of being welcomed and valued for who you are. Acceptance creates a sense of belonging and security.',
        relatedFeelings: ['Valued', 'Respected', 'Welcomed']
    },
    'trust-4-hopeful': {
        name: 'Hopeful',
        category: 'Trust',
        color: '#89c24f',
        description: 'A feeling of expectation and desire for positive outcomes. Hope motivates you to keep moving forward even in difficult times.',
        relatedFeelings: ['Longing', 'Expectant', 'Optimistic']
    },
    'fear-1-nervous': {
        name: 'Nervous',
        category: 'Fear',
        color: '#03a54c',
        description: 'A state of unease or apprehension about something uncertain. Nervousness is a natural response to situations that feel challenging or unfamiliar.',
        relatedFeelings: ['Threatened', 'Uneasy', 'Jittery']
    },
    'fear-2-scared': {
        name: 'Scared',
        category: 'Fear',
        color: '#03a54c',
        description: 'An intense feeling of fear or alarm. Being scared is your body\'s way of alerting you to potential danger.',
        relatedFeelings: ['Frightened', 'Terrified', 'Alarmed']
    },
    'fear-3-anxious': {
        name: 'Anxious',
        category: 'Fear',
        color: '#03a54c',
        description: 'A feeling of worry, nervousness, or unease about something with an uncertain outcome. Anxiety can be a signal to prepare or take action.',
        relatedFeelings: ['Dread', 'Worry', 'Tense']
    },
    'fear-4-insecure': {
        name: 'Insecure',
        category: 'Fear',
        color: '#03a54c',
        description: 'A lack of confidence or certainty about yourself or your place in a situation. Insecurity often stems from self-doubt or fear of rejection.',
        relatedFeelings: ['Rejected', 'Inadequate', 'Uncertain']
    },
    'surprise-1-startled': {
        name: 'Startled',
        category: 'Surprise',
        color: '#2782c5',
        description: 'A sudden feeling of shock or alarm caused by something unexpected. Being startled is an immediate, automatic response to surprise.',
        relatedFeelings: ['Appalled', 'Shocked', 'Stunned']
    },
    'surprise-2-confused': {
        name: 'Confused',
        category: 'Surprise',
        color: '#2782c5',
        description: 'A state of being bewildered or unclear about something. Confusion occurs when information doesn\'t match your expectations or understanding.',
        relatedFeelings: ['Disillusioned', 'Perplexed', 'Bewildered']
    },
    'surprise-3-amazed': {
        name: 'Amazed',
        category: 'Surprise',
        color: '#2782c5',
        description: 'A feeling of great wonder and astonishment. Amazement is a positive form of surprise that fills you with awe.',
        relatedFeelings: ['Astonished', 'Awed', 'Impressed']
    },
    'surprise-4-disappointed': {
        name: 'Disappointed',
        category: 'Surprise',
        color: '#2782c5',
        description: 'A feeling of sadness or displeasure when expectations are not met. Disappointment signals a gap between what you hoped for and reality.',
        relatedFeelings: ['Betrayed', 'Dismayed', 'Let down']
    },
    'sad-1-hurt': {
        name: 'Hurt',
        category: 'Sadness',
        color: '#34689d',
        description: 'Emotional pain caused by something or someone. Hurt feelings often arise from perceived rejection, criticism, or loss.',
        relatedFeelings: ['Dismayed', 'Threatened', 'Wounded']
    },
    'sad-2-depressed': {
        name: 'Depressed',
        category: 'Sadness',
        color: '#34689d',
        description: 'A state of deep sadness and low energy. Depression can make everything feel heavy and difficult to manage.',
        relatedFeelings: ['Bereft', 'Numb', 'Empty']
    },
    'sad-3-lonely': {
        name: 'Lonely',
        category: 'Sadness',
        color: '#34689d',
        description: 'A painful feeling of isolation or disconnection from others. Loneliness highlights our need for meaningful connection.',
        relatedFeelings: ['Abandoned', 'Isolated', 'Disconnected']
    },
    'sad-4-ashamed': {
        name: 'Ashamed',
        category: 'Sadness',
        color: '#34689d',
        description: 'A painful feeling of humiliation or distress caused by believing you\'ve done something wrong or embarrassing. Shame affects how you see yourself.',
        relatedFeelings: ['Remorseful', 'Guilty', 'Embarrassed']
    },
    'disgust-1-dislike': {
        name: 'Dislike',
        category: 'Disgust',
        color: '#8774b3',
        description: 'A feeling of aversion or disapproval toward something or someone. Dislike helps you identify what doesn\'t align with your values.',
        relatedFeelings: ['Revolted', 'Withdrawn', 'Repulsed']
    },
    'disgust-2-avoidance': {
        name: 'Avoidance',
        category: 'Disgust',
        color: '#8774b3',
        description: 'A tendency to stay away from something unpleasant or uncomfortable. Avoidance is a protective response to things that feel threatening.',
        relatedFeelings: ['Hesitant', 'Averse', 'Reluctant']
    },
    'disgust-3-aweful': {
        name: 'Awful',
        category: 'Disgust',
        color: '#8774b3',
        description: 'A strong negative feeling about something very unpleasant or disagreeable. Feeling awful signals that something is deeply wrong or distressing.',
        relatedFeelings: ['Repelled', 'Detested', 'Horrible']
    },
    'disgust-4-disapproval': {
        name: 'Disapproval',
        category: 'Disgust',
        color: '#8774b3',
        description: 'A negative judgment or opinion about someone or something. Disapproval reflects a conflict between your values and what you observe.',
        relatedFeelings: ['Loathing', 'Judgmental', 'Critical']
    },
    'anger-1-aggressive': {
        name: 'Aggressive',
        category: 'Anger',
        color: '#f05d5f',
        description: 'A forceful and confrontational expression of anger. Aggression is often a response to feeling threatened or frustrated.',
        relatedFeelings: ['Hostile', 'Provoked', 'Combative']
    },
    'anger-2-mad': {
        name: 'Mad',
        category: 'Anger',
        color: '#f05d5f',
        description: 'An intense feeling of displeasure or rage. Being mad signals that something has violated your boundaries or expectations.',
        relatedFeelings: ['Enraged', 'Furious', 'Livid']
    },
    'anger-3-frustrated': {
        name: 'Frustrated',
        category: 'Anger',
        color: '#f05d5f',
        description: 'A feeling of upset or annoyance when unable to achieve something. Frustration arises from blocked goals or unmet needs.',
        relatedFeelings: ['Annoyed', 'Irritated', 'Exasperated']
    },
    'anger-4-critical': {
        name: 'Critical',
        category: 'Anger',
        color: '#f05d5f',
        description: 'A tendency to find fault or judge harshly. Being critical can be a form of anger directed at perceived flaws or failures.',
        relatedFeelings: ['Sarcastic', 'Skeptical', 'Judgmental']
    },
    'anticipation-1-excited': {
        name: 'Excited',
        category: 'Anticipation',
        color: '#f2913b',
        description: 'A feeling of enthusiastic eagerness about something that\'s going to happen. Excitement energizes you and creates positive anticipation.',
        relatedFeelings: ['Passionate', 'Energized', 'Thrilled']
    },
    'anticipation-2-eager': {
        name: 'Eager',
        category: 'Anticipation',
        color: '#f2913b',
        description: 'A keen desire or readiness to do or experience something. Eagerness drives you forward with enthusiasm and motivation.',
        relatedFeelings: ['Enthusiastic', 'Motivated', 'Keen']
    },
    'anticipation-3-interested': {
        name: 'Interested',
        category: 'Anticipation',
        color: '#f2913b',
        description: 'A feeling of wanting to learn more or be involved in something. Interest draws your attention and curiosity toward new experiences.',
        relatedFeelings: ['Impatient', 'Curious', 'Engaged']
    },
    'anticipation-4-stressed': {
        name: 'Stressed',
        category: 'Anticipation',
        color: '#f2913b',
        description: 'A state of mental or emotional strain from demanding circumstances. Stress signals that you\'re facing challenges that require energy and resources.',
        relatedFeelings: ['Overwhelmed', 'Pressured', 'Tense']
    }
};
