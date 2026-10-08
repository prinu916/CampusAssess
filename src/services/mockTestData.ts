import { Test, McqQuestion, CodingProblem } from '../types/test.types';

export const MOCK_MCQ_QUESTIONS: McqQuestion[] = [
  {
    id: 'q1',
    order: 1,
    question: 'Which of the following principles of OOP is illustrated by method overriding in Java?',
    options: [
      { id: 'A', text: 'Encapsulation' },
      { id: 'B', text: 'Runtime Polymorphism' },
      { id: 'C', text: 'Compile-time Polymorphism' },
      { id: 'D', text: 'Data Hiding' },
    ],
    correctAnswer: 'B',
    marks: 2.5,
    explanation: 'Method overriding in Java is resolved at runtime via dynamic method dispatch, illustrating runtime polymorphism.',
  },
  {
    id: 'q2',
    order: 2,
    question: 'What is the default initial capacity and load factor of a standard java.util.HashMap?',
    options: [
      { id: 'A', text: 'Capacity: 16, Load Factor: 0.75' },
      { id: 'B', text: 'Capacity: 10, Load Factor: 0.50' },
      { id: 'C', text: 'Capacity: 32, Load Factor: 0.80' },
      { id: 'D', text: 'Capacity: 16, Load Factor: 1.00' },
    ],
    correctAnswer: 'A',
    marks: 2.5,
    explanation: 'Java HashMap defaults to an initial capacity of 16 (2^4) and a load factor of 0.75f.',
  },
  {
    id: 'q3',
    order: 3,
    question: 'Which garbage collection algorithm is typically used by default in modern OpenJDK 17 LTS for standard server configurations?',
    options: [
      { id: 'A', text: 'Serial Garbage Collector' },
      { id: 'B', text: 'G1 (Garbage-First) Collector' },
      { id: 'C', text: 'ZGC (Z Garbage Collector)' },
      { id: 'D', text: 'Parallel Garbage Collector' },
    ],
    correctAnswer: 'B',
    marks: 2.5,
    explanation: 'G1 GC has been the default collector for server configurations since Java 9 onwards.',
  },
  {
    id: 'q4',
    order: 4,
    question: 'What is the purpose of the `volatile` keyword in Java multi-threading?',
    options: [
      { id: 'A', text: 'Guarantees atomicity of compound operations like incrementing a variable' },
      { id: 'B', text: 'Ensures visibility of changes to variables across threads and prevents instruction reordering' },
      { id: 'C', text: 'Locks the object monitor before entering the variable assignment' },
      { id: 'D', text: 'Prevents the garbage collector from reclaiming the variable reference' },
    ],
    correctAnswer: 'B',
    marks: 2.5,
    explanation: 'The volatile keyword guarantees visibility (happens-before relationship) and prevents memory instruction reordering without acquiring a monitor lock.',
  },
  {
    id: 'q5',
    order: 5,
    question: 'Which of the following functional interfaces in `java.util.function` takes two arguments and produces a result?',
    options: [
      { id: 'A', text: 'BiConsumer<T, U>' },
      { id: 'B', text: 'BinaryOperator<T>' },
      { id: 'C', text: 'BiFunction<T, U, R>' },
      { id: 'D', text: 'Predicate<T>' },
    ],
    correctAnswer: 'C',
    marks: 2.5,
    explanation: 'BiFunction<T, U, R> accepts two arguments (types T and U) and produces a result of type R.',
  },
  {
    id: 'q6',
    order: 6,
    question: 'What happens when a subclass attempts to override a `static` method declared in its parent class?',
    options: [
      { id: 'A', text: 'A compilation error is generated: static methods cannot be re-declared' },
      { id: 'B', text: 'The method is overridden and dynamic dispatch invokes the child method at runtime' },
      { id: 'C', text: 'Method hiding occurs; the method called depends on the reference type at compile-time' },
      { id: 'D', text: 'A runtime `ClassCastException` is thrown' },
    ],
    correctAnswer: 'C',
    marks: 2.5,
    explanation: 'Static methods cannot be overridden dynamically; they are hidden, resolved statically at compile-time based on reference type.',
  },
  {
    id: 'q7',
    order: 7,
    question: 'In Java NIO, which channel allows asynchronous file operations non-blocking read/write operations?',
    options: [
      { id: 'A', text: 'AsynchronousFileChannel' },
      { id: 'B', text: 'FileChannel' },
      { id: 'C', text: 'PipedChannel' },
      { id: 'D', text: 'BufferedInputStream' },
    ],
    correctAnswer: 'A',
    marks: 2.5,
  },
  {
    id: 'q8',
    order: 8,
    question: 'What is the time complexity of searching for an element in a balanced Java `TreeSet` (Red-Black tree)?',
    options: [
      { id: 'A', text: 'O(1)' },
      { id: 'B', text: 'O(log n)' },
      { id: 'C', text: 'O(n)' },
      { id: 'D', text: 'O(n log n)' },
    ],
    correctAnswer: 'B',
    marks: 2.5,
  },
  {
    id: 'q9',
    order: 9,
    question: 'Which of the following statement about Java Streams is TRUE?',
    options: [
      { id: 'A', text: 'Streams modify the underlying data source directly' },
      { id: 'B', text: 'Intermediate stream operations are lazy and executed only when a terminal operation is called' },
      { id: 'C', text: 'A stream can be traversed and re-consumed multiple times' },
      { id: 'D', text: 'Streams do not support parallel processing' },
    ],
    correctAnswer: 'B',
    marks: 2.5,
  },
  {
    id: 'q10',
    order: 10,
    question: 'Which memory pool in the JVM stores metadata about loaded classes in Java 8 and later?',
    options: [
      { id: 'A', text: 'PermGen (Permanent Generation)' },
      { id: 'B', text: 'Metaspace (native memory)' },
      { id: 'C', text: 'Java Heap Survivor Space' },
      { id: 'D', text: 'Thread Stack' },
    ],
    correctAnswer: 'B',
    marks: 2.5,
  },
  {
    id: 'q11',
    order: 11,
    question: 'What is the contract between `equals()` and `hashCode()` in Java?',
    options: [
      { id: 'A', text: 'If hashCode() returns same value, equals() MUST return true' },
      { id: 'B', text: 'If equals() returns true, hashCode() MUST return the same integer value for both objects' },
      { id: 'C', text: 'There is no strict contract between equals() and hashCode()' },
      { id: 'D', text: 'Both methods must always return prime numbers' },
    ],
    correctAnswer: 'B',
    marks: 2.5,
  },
  {
    id: 'q12',
    order: 12,
    question: 'Which of the following exceptions is an unchecked (Runtime) exception in Java?',
    options: [
      { id: 'A', text: 'java.io.IOException' },
      { id: 'B', text: 'java.sql.SQLException' },
      { id: 'C', text: 'java.lang.IllegalArgumentException' },
      { id: 'D', text: 'java.lang.ClassNotFoundException' },
    ],
    correctAnswer: 'C',
    marks: 2.5,
  },
  {
    id: 'q13',
    order: 13,
    question: 'How do Java 14+ Records declare immutable data containers?',
    options: [
      { id: 'A', text: 'All fields are implicitly private final, and canonical constructor and accessors are generated' },
      { id: 'B', text: 'Fields are public mutable by default' },
      { id: 'C', text: 'Records cannot implement interfaces' },
      { id: 'D', text: 'Records can extend any abstract class' },
    ],
    correctAnswer: 'A',
    marks: 2.5,
  },
  {
    id: 'q14',
    order: 14,
    question: 'What does the `Thread.join()` method do?',
    options: [
      { id: 'A', text: 'Merges two thread stacks into one execution context' },
      { id: 'B', text: 'Causes current thread to wait until the thread it joined completes its execution' },
      { id: 'C', text: 'Terminates the target thread immediately' },
      { id: 'D', text: 'Synchronizes shared data between two threads' },
    ],
    correctAnswer: 'B',
    marks: 2.5,
  },
  {
    id: 'q15',
    order: 15,
    question: 'What is the difference between `Comparable` and `Comparator`?',
    options: [
      { id: 'A', text: 'Comparable is in java.util and defines compare(o1, o2); Comparator is in java.lang' },
      { id: 'B', text: 'Comparable defines natural ordering via compareTo(o); Comparator defines custom external ordering' },
      { id: 'C', text: 'Comparable only works with Strings and Primitives' },
      { id: 'D', text: 'There is no functional difference' },
    ],
    correctAnswer: 'B',
    marks: 2.5,
  },
  {
    id: 'q16',
    order: 16,
    question: 'Which method in the `Object` class is protected and called by garbage collector before reclaiming memory?',
    options: [
      { id: 'A', text: 'dispose()' },
      { id: 'B', text: 'finalize()' },
      { id: 'C', text: 'destroy()' },
      { id: 'D', text: 'cleanUp()' },
    ],
    correctAnswer: 'B',
    marks: 2.5,
  },
  {
    id: 'q17',
    order: 17,
    question: 'Which collection implementation is thread-safe and does NOT lock the entire container for reads?',
    options: [
      { id: 'A', text: 'java.util.Hashtable' },
      { id: 'B', text: 'java.util.concurrent.ConcurrentHashMap' },
      { id: 'C', text: 'java.util.Collections.synchronizedMap()' },
      { id: 'D', text: 'java.util.TreeMap' },
    ],
    correctAnswer: 'B',
    marks: 2.5,
  },
  {
    id: 'q18',
    order: 18,
    question: 'What does the `transient` keyword signify when applied to a class field?',
    options: [
      { id: 'A', text: 'The field cannot be accessed from outside the package' },
      { id: 'B', text: 'The field will not be serialized when the object is serialized' },
      { id: 'C', text: 'The field is stored in CPU registers only' },
      { id: 'D', text: 'The field value is calculated lazily' },
    ],
    correctAnswer: 'B',
    marks: 2.5,
  },
  {
    id: 'q19',
    order: 19,
    question: 'Which feature introduced in Java 8 allows interface methods to have a default implementation body?',
    options: [
      { id: 'A', text: 'abstract methods' },
      { id: 'B', text: 'default methods' },
      { id: 'C', text: 'virtual methods' },
      { id: 'D', text: 'stub methods' },
    ],
    correctAnswer: 'B',
    marks: 2.5,
  },
  {
    id: 'q20',
    order: 20,
    question: 'Which operator in Java tests whether an object reference is an instance of a specified class or subclass?',
    options: [
      { id: 'A', text: 'typeof' },
      { id: 'B', text: 'is' },
      { id: 'C', text: 'instanceof' },
      { id: 'D', text: 'typeid' },
    ],
    correctAnswer: 'C',
    marks: 2.5,
  },
];

export const MOCK_CODING_PROBLEMS: CodingProblem[] = [
  {
    id: 'cp_01',
    order: 1,
    title: 'Two Sum with Target Index',
    description: 'Given an array of integers `nums` and an integer `target`, return the 0-based indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input has exactly one solution, and you may not use the same element twice. Return the indices separated by a space.',
    inputFormat: 'First line contains integer N (size of array).\nSecond line contains N space-separated integers.\nThird line contains integer target.',
    outputFormat: 'Print the two indices separated by a space in ascending order.',
    constraints: '2 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nExactly one valid answer exists.',
    examples: [
      {
        input: '4\n2 7 11 15\n9',
        output: '0 1',
        explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9, we return 0 1.',
      },
      {
        input: '3\n3 2 4\n6',
        output: '1 2',
        explanation: 'Because nums[1] + nums[2] == 2 + 4 == 6, we return 1 2.',
      },
    ],
    allowedLanguages: ['cpp', 'java', 'python', 'javascript'],
    timeLimit: 2,
    memoryLimit: 256,
    testCases: [
      { id: 'tc1', input: '4\n2 7 11 15\n9', expectedOutput: '0 1', isHidden: false, marks: 10 },
      { id: 'tc2', input: '3\n3 2 4\n6', expectedOutput: '1 2', isHidden: false, marks: 10 },
      { id: 'tc3', input: '2\n3 3\n6', expectedOutput: '0 1', isHidden: true, marks: 15 },
    ],
    starterCode: {
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        int target = sc.nextInt();

        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < n; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                System.out.println(map.get(complement) + " " + i);
                return;
            }
            map.put(nums[i], i);
        }
    }
}`,
      python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    nums = [int(x) for x in lines[1:n+1]]
    target = int(lines[n+1])
    
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            print(f"{seen[complement]} {i}")
            return
        seen[num] = i

if __name__ == "__main__":
    solve()`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target;
    cin >> target;

    unordered_map<int, int> seen;
    for (int i = 0; i < n; i++) {
        int comp = target - nums[i];
        if (seen.count(comp)) {
            cout << seen[comp] << " " << i << endl;
            return 0;
        }
        seen[nums[i]] = i;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function main() {
    const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!tokens.length || tokens[0] === '') return;
    const n = parseInt(tokens[0]);
    const nums = tokens.slice(1, n + 1).map(Number);
    const target = parseInt(tokens[n + 1]);

    const seen = new Map();
    for (let i = 0; i < n; i++) {
        const comp = target - nums[i];
        if (seen.has(comp)) {
            console.log(seen.get(comp) + ' ' + i);
            return;
        }
        seen.set(nums[i], i);
    }
}
main();`,
    },
  },
  {
    id: 'cp_02',
    order: 2,
    title: 'Balanced Parentheses & Brackets Validation',
    description: 'Given a string `s` containing only the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    inputFormat: 'A single string `s` containing bracket characters.',
    outputFormat: 'Print "true" if the bracket string is valid, or "false" otherwise.',
    constraints: '1 <= s.length <= 10^5\nString contains only ()[]{} characters.',
    examples: [
      {
        input: '()[]{}',
        output: 'true',
        explanation: 'All brackets are closed in proper order.',
      },
      {
        input: '(]',
        output: 'false',
        explanation: 'Mismatched closing bracket.',
      },
    ],
    allowedLanguages: ['cpp', 'java', 'python', 'javascript'],
    timeLimit: 2,
    memoryLimit: 256,
    testCases: [
      { id: 'tc4', input: '()[]{}', expectedOutput: 'true', isHidden: false, marks: 10 },
      { id: 'tc5', input: '(]', expectedOutput: 'false', isHidden: false, marks: 10 },
      { id: 'tc6', input: '{[()]}', expectedOutput: 'true', isHidden: true, marks: 15 },
    ],
    starterCode: {
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) {
            System.out.println("false");
            return;
        }
        String s = sc.next();
        Stack<Character> stack = new Stack<>();
        
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else {
                if (stack.isEmpty() || stack.pop() != c) {
                    System.out.println("false");
                    return;
                }
            }
        }
        System.out.println(stack.isEmpty() ? "true" : "false");
    }
}`,
      python: `import sys

def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    print("true" if isValid(line) else "false")`,
      cpp: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;
    stack<char> st;
    for (char c : s) {
        if (c == '(') st.push(')');
        else if (c == '{') st.push('}');
        else if (c == '[') st.push(']');
        else {
            if (st.empty() || st.top() != c) {
                cout << "false" << endl;
                return 0;
            }
            st.pop();
        }
    }
    cout << (st.empty() ? "true" : "false") << endl;
    return 0;
}`,
      javascript: `const fs = require('fs');

function main() {
    const s = fs.readFileSync(0, 'utf-8').trim();
    const stack = [];
    for (let c of s) {
        if (c === '(') stack.push(')');
        else if (c === '{') stack.push('}');
        else if (c === '[') stack.push(']');
        else {
            if (stack.pop() !== c) {
                console.log('false');
                return;
            }
        }
    }
    console.log(stack.length === 0 ? 'true' : 'false');
}
main();`,
    },
  },
  {
    id: 'cp_03',
    order: 3,
    title: 'Maximum Subarray Sum (Kadane\'s Variant)',
    description: 'Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
    inputFormat: 'First line contains integer N.\nSecond line contains N space-separated integers.',
    outputFormat: 'Print the maximum subarray sum as a single integer.',
    constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
    examples: [
      {
        input: '9\n-2 1 -3 4 -1 2 1 -5 4',
        output: '6',
        explanation: 'The subarray [4, -1, 2, 1] has the largest sum = 6.',
      },
      {
        input: '5\n5 4 -1 7 8',
        output: '23',
        explanation: 'The entire array adds up to 23.',
      },
    ],
    allowedLanguages: ['cpp', 'java', 'python', 'javascript'],
    timeLimit: 2,
    memoryLimit: 256,
    testCases: [
      { id: 'tc7', input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isHidden: false, marks: 10 },
      { id: 'tc8', input: '5\n5 4 -1 7 8', expectedOutput: '23', isHidden: false, marks: 10 },
      { id: 'tc9', input: '1\n-1', expectedOutput: '-1', isHidden: true, marks: 15 },
    ],
    starterCode: {
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long maxSoFar = Long.MIN_VALUE;
        long currentMax = 0;

        for (int i = 0; i < n; i++) {
            long x = sc.nextLong();
            currentMax += x;
            if (maxSoFar < currentMax) {
                maxSoFar = currentMax;
            }
            if (currentMax < 0) {
                currentMax = 0;
            }
        }
        System.out.println(maxSoFar);
    }
}`,
      python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:n+1]]
    
    max_so_far = nums[0]
    curr_max = nums[0]
    for x in nums[1:]:
        curr_max = max(x, curr_max + x)
        max_so_far = max(max_so_far, curr_max)
    print(max_so_far)

if __name__ == "__main__":
    solve()`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    long long curr = 0, best = -1e18;
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        curr = max(x, curr + x);
        best = max(best, curr);
    }
    cout << best << endl;
    return 0;
}`,
      javascript: `const fs = require('fs');

function main() {
    const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!tokens.length || tokens[0] === '') return;
    const n = parseInt(tokens[0]);
    const nums = tokens.slice(1, n + 1).map(Number);
    
    let curr = nums[0];
    let best = nums[0];
    for (let i = 1; i < n; i++) {
        curr = Math.max(nums[i], curr + nums[i]);
        best = Math.max(best, curr);
    }
    console.log(best);
}
main();`,
    },
  },
];

export const INITIAL_TESTS: Test[] = [
  {
    id: 'test_java_mcq',
    title: 'Java Programming',
    subject: 'Object-Oriented Programming (CS301)',
    description: 'Comprehensive assessment on Core Java, OOP fundamentals, Collections framework, Multi-threading, and Modern JVM concepts.',
    type: 'MCQ',
    duration: 30, // 30 mins
    startTime: '2026-10-08T00:00:00Z',
    endTime: '2026-10-15T23:59:59Z',
    maxMarks: 50,
    instructions: [
      'Each question carries 2.5 marks. There is no negative marking for incorrect answers.',
      'The test will automatically submit when the countdown reaches 00:00.',
      'Do not switch browser tabs or minimize the assessment window during the test.',
      'Ensure a steady internet connection. Your answers are auto-saved on each selection.',
      'Once submitted, answers cannot be edited or reviewed further.',
    ],
    questions: MOCK_MCQ_QUESTIONS,
    access: { type: 'ALL' },
    status: 'available',
    createdByName: 'Dr. Aris Thorne',
    createdAt: '2026-10-01T09:00:00Z',
    participantsCount: 48,
    submissionsCount: 39,
  },
  {
    id: 'test_dsa_coding',
    title: 'DSA Coding Challenge',
    subject: 'Data Structures & Algorithms (CS303)',
    description: 'Hands-on practical programming assessment evaluating algorithm complexity, arrays, stack operations, and dynamic programming.',
    type: 'CODING',
    duration: 60, // 60 mins
    startTime: '2026-10-08T00:00:00Z',
    endTime: '2026-10-18T23:59:59Z',
    maxMarks: 100,
    instructions: [
      'This coding assessment consists of 3 algorithmic problems.',
      'You may code in C++, Java, Python, or JavaScript using the in-browser IDE.',
      'Use the "Run" button to execute your solution against visible sample test cases.',
      'Click "Submit Problem" to validate your solution against hidden evaluation test cases.',
      'Do not navigate away from this screen. Full-screen proctoring mode is active.',
    ],
    problems: MOCK_CODING_PROBLEMS,
    access: { type: 'ALL' },
    status: 'available',
    createdByName: 'Dr. Aris Thorne',
    createdAt: '2026-10-02T10:00:00Z',
    participantsCount: 45,
    submissionsCount: 28,
  },
  {
    id: 'test_dbms_mcq',
    title: 'Database Management Systems',
    subject: 'DBMS & Query Optimization (CS304)',
    description: 'Mid-term evaluation covering relational algebra, normalization up to BCNF, ACID transactions, and indexing structures.',
    type: 'MCQ',
    duration: 45,
    startTime: '2026-10-07T00:00:00Z',
    endTime: '2026-10-20T23:59:59Z',
    maxMarks: 50,
    instructions: [
      '20 questions covering theoretical and practical SQL concepts.',
      'Each question has four options with only one correct choice.',
      'All responses are saved in real-time.',
    ],
    questions: MOCK_MCQ_QUESTIONS.slice(0, 10),
    access: { type: 'ALL' },
    status: 'available',
    createdByName: 'Prof. Ramesh Sharma',
    createdAt: '2026-10-03T11:00:00Z',
    participantsCount: 52,
    submissionsCount: 34,
  },
  {
    id: 'test_os_upcoming',
    title: 'Operating Systems Internal Assessment',
    subject: 'Systems Programming & OS (CS305)',
    description: 'Evaluation on process scheduling algorithms, deadlock detection and recovery, paging, and virtual memory management.',
    type: 'MCQ',
    duration: 45,
    startTime: '2026-10-12T10:00:00Z',
    endTime: '2026-10-12T11:30:00Z',
    maxMarks: 60,
    instructions: [
      'Assessment will become active precisely at the scheduled start time.',
      'Late entries beyond 15 minutes will not be admitted.',
    ],
    questions: MOCK_MCQ_QUESTIONS.slice(0, 15),
    access: { type: 'SELECTED', department: 'Department of Computer Science', semester: '6th Semester' },
    status: 'upcoming',
    createdByName: 'Dr. Aris Thorne',
    createdAt: '2026-10-04T08:30:00Z',
    participantsCount: 60,
    submissionsCount: 0,
  },
  {
    id: 'test_web_completed',
    title: 'Web Technologies & Cloud Fundamentals',
    subject: 'Internet Architecture (CS306)',
    description: 'Final test on HTTP/3 protocols, RESTful microservices, WebSocket bidirectional streams, and container virtualization.',
    type: 'MCQ',
    duration: 30,
    startTime: '2026-09-20T10:00:00Z',
    endTime: '2026-09-20T11:00:00Z',
    maxMarks: 50,
    instructions: [
      'This exam has concluded.',
    ],
    questions: MOCK_MCQ_QUESTIONS.slice(0, 20),
    access: { type: 'ALL' },
    status: 'completed',
    createdByName: 'Dr. Aris Thorne',
    createdAt: '2026-09-15T09:00:00Z',
    participantsCount: 50,
    submissionsCount: 49,
  },
];
