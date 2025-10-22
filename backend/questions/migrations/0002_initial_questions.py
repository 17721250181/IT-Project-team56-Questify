from django.db import migrations
import uuid


def create_initial_questions(apps, schema_editor):
    User = apps.get_model("auth", "User")
    Question = apps.get_model("questions", "Question")
    MCQQuestion = apps.get_model("questions", "MCQQuestion")
    ShortAnswerQuestion = apps.get_model("questions", "ShortAnswerQuestion")

    # get default users
    alice = User.objects.filter(username="alice").first()
    bob = User.objects.filter(username="bob").first()
    if not (alice and bob):
        return

    # MCQ questions created by Alice (converted from JSON quiz data)
    mcq_questions = [
        # Week 1 - JAVA basics
        {
            "question": "Which of the following is NOT a valid primitive data type in Java?",
            "options": ["int", "float", "string", "char", "boolean"],
            "correct": ["C"],
            "week": "Week1",
            "topic": "JAVA basics"
        },
        {
            "question": "Which statements about Java variables are true?",
            "options": [
                "A variable must be declared before use",
                "Variable names can start with a number",
                "Local variables require initialization before use",
                "Static variables belong to the class rather than any instance",
                "Variables declared inside a method are global"
            ],
            "correct": ["A", "C", "D"],
            "week": "Week1",
            "topic": "JAVA basics"
        },
        # Week 2 - Classes and Objects
        {
            "question": "Which statements about classes and objects are true?",
            "options": [
                "A class defines attributes and behaviors",
                "An object is an instance of a class",
                "A class can exist without objects",
                "Two objects of the same class share the same memory",
                "Classes can be declared inside other classes"
            ],
            "correct": ["A", "B", "C", "E"],
            "week": "Week2",
            "topic": "Classes and Objects"
        },
        # Week 3 - Software Tools and Bagel
        {
            "question": "Which command is used to compile a Java program from the command line?",
            "options": ["java", "javac", "jar", "javadoc", "JVM"],
            "correct": ["B"],
            "week": "Week3",
            "topic": "Software Tools and Bagel"
        },
        {
            "question": "Which of the following tools executes compiled Java bytecode?",
            "options": ["JVM", "javac", "JAR", "Javadoc", "JUnit"],
            "correct": ["A"],
            "week": "Week3",
            "topic": "Software Tools and Bagel"
        },
        # Week 4 - Arrays and Strings
        {
            "question": "What will be the output of 'System.out.println(\"Hello\".length());'?",
            "options": ["4", "5", "6", "Error", "None of the above"],
            "correct": ["B"],
            "week": "Week4",
            "topic": "Arrays and Strings"
        },
        # Week 4 - Input and Output
        {
            "question": "Which of the following is used to read input from the console in Java?",
            "options": [
                "System.read()",
                "Console.read()",
                "Scanner class",
                "BufferedWriter",
                "PrintWriter"
            ],
            "correct": ["C"],
            "week": "Week4",
            "topic": "Input and Output"
        },
        # Week 5 - Inheritance and Polymorphism
        {
            "question": "Which statements about inheritance are true?",
            "options": [
                "A subclass can inherit from multiple superclasses",
                "The 'super' keyword accesses parent constructors",
                "Private members of a superclass are not accessible by subclasses",
                "The 'final' keyword prevents a class from being extended",
                "Subclasses must override all superclass methods"
            ],
            "correct": ["B", "C", "D"],
            "week": "Week5",
            "topic": "Inheritance and Polymorphism"
        },
        # Week 6 - Interfaces and Polymorphism
        {
            "question": "Which of the following statements about interfaces are correct?",
            "options": [
                "An interface can have abstract methods",
                "A class can implement multiple interfaces",
                "An interface can contain constructors",
                "Interfaces support default and static methods since Java 8",
                "All methods in an interface must be private"
            ],
            "correct": ["A", "B", "D"],
            "week": "Week6",
            "topic": "Interfaces and Polymorphism"
        },
        # Week 7 - Modelling Classes and Relationships
        {
            "question": "Which relationships are commonly represented in class diagrams?",
            "options": [
                "Association",
                "Aggregation",
                "Composition",
                "Implementation",
                "Abstraction"
            ],
            "correct": ["A", "B", "C", "D"],
            "week": "Week7",
            "topic": "Modelling Classes and Relationships"
        },
        # Week 8 - Generics
        {
            "question": "What are the benefits of using Generics in Java?",
            "options": [
                "Compile-time type safety",
                "Elimination of explicit type casting",
                "Reduced runtime performance",
                "Code reusability",
                "Increased risk of ClassCastException"
            ],
            "correct": ["A", "B", "D"],
            "week": "Week8",
            "topic": "Generics"
        },
        {
            "question": "Which of the following correctly declares a generic class?",
            "options": [
                "class Box { }",
                "class Box<T> { }",
                "class Box<T extends Number> { }",
                "Both B and C",
                "None of the above"
            ],
            "correct": ["D"],
            "week": "Week8",
            "topic": "Generics"
        },
        # Week 8 - Collections and Maps
        {
            "question": "Which Java collection guarantees unique elements and no defined order?",
            "options": ["ArrayList", "LinkedList", "HashSet", "TreeMap", "Vector"],
            "correct": ["C"],
            "week": "Week8",
            "topic": "Collections and Maps"
        },
        # Week 9 - Design Patterns
        {
            "question": "Which design pattern ensures only one instance of a class exists?",
            "options": [
                "Factory Pattern",
                "Singleton Pattern",
                "Observer Pattern",
                "Adapter Pattern",
                "Strategy Pattern"
            ],
            "correct": ["B"],
            "week": "Week9",
            "topic": "Design Patterns"
        },
        {
            "question": "Which of the following are behavioral design patterns?",
            "options": [
                "Observer",
                "Strategy",
                "Singleton",
                "Template Method",
                "Builder"
            ],
            "correct": ["A", "B", "D"],
            "week": "Week9",
            "topic": "Design Patterns"
        },
        # Week 10 - Software Testing and Design
        {
            "question": "Which testing technique verifies that individual methods work as intended?",
            "options": [
                "Integration testing",
                "Unit testing",
                "System testing",
                "Acceptance testing",
                "Regression testing"
            ],
            "correct": ["B"],
            "week": "Week10",
            "topic": "Software Testing and Design"
        },
        # Week 10 - Exceptions
        {
            "question": "Which of the following are checked exceptions?",
            "options": [
                "IOException",
                "SQLException",
                "NullPointerException",
                "FileNotFoundException",
                "ArrayIndexOutOfBoundsException"
            ],
            "correct": ["A", "B", "D"],
            "week": "Week10",
            "topic": "Exceptions"
        },
        # Week 11 - Event Driven Programming
        {
            "question": "In event-driven programming, what typically triggers an event handler?",
            "options": [
                "Compiler",
                "User actions or system events",
                "Garbage collection",
                "Thread termination",
                "Main method"
            ],
            "correct": ["B"],
            "week": "Week11",
            "topic": "Event Driven Programming"
        },
        # Week 12 - Advanced Java
        {
            "question": "Which Java 8+ features support functional programming?",
            "options": [
                "Lambda expressions",
                "Stream API",
                "Anonymous inner classes",
                "Pattern matching for instanceof",
                "Enhanced switch expressions"
            ],
            "correct": ["A", "B", "D", "E"],
            "week": "Week12",
            "topic": "Advanced Java"
        },
        {
            "question": "Which feature enables parallel processing of data collections in Java?",
            "options": [
                "Streams API",
                "Threads API",
                "ForkJoin Framework",
                "Parallel Streams",
                "ExecutorService"
            ],
            "correct": ["D"],
            "week": "Week12",
            "topic": "Advanced Java"
        },
    ]

    for q in mcq_questions:
        base_q = Question.objects.create(
            id=uuid.uuid4(),
            question=q["question"],
            creator=alice,
            source="STUDENT",
            type="MCQ",
            week=q.get("week", ""),
            topic=q.get("topic", ""),
        )
        MCQQuestion.objects.create(
            question=base_q,
            option_a=q["options"][0],
            option_b=q["options"][1],
            option_c=q["options"][2],
            option_d=q["options"][3],
            option_e=q["options"][4],
            correct_options=q["correct"],  #save as list
        )

    # Short answer questions created by Bob
    short_questions = [
        # Week 1 - JAVA basics
        {
            "question": "What are the eight primitive data types in Java?",
            "answer": "The eight primitive data types are: byte, short, int, long, float, double, boolean, and char.",
            "ai_answer": "Java has eight primitive types: four integer types (byte, short, int, long), two floating-point types (float, double), one character type (char), and one boolean type (boolean).",
            "week": "Week1",
            "topic": "JAVA basics"
        },
        # Week 2 - Classes and Objects
        {
            "question": "Explain the concept of a class in object-oriented programming.",
            "answer": "A class is a blueprint or template that defines the attributes (data) and behaviors (methods) that objects of that class will have.",
            "ai_answer": "A class encapsulates data and methods that operate on that data, serving as a template for creating objects with shared characteristics.",
            "week": "Week2",
            "topic": "Classes and Objects"
        },
        {
            "question": "Why is encapsulation important in OOSD?",
            "answer": "It hides internal implementation details and exposes only necessary parts.",
            "ai_answer": "Encapsulation improves maintainability, security, and modularity.",
            "week": "Week2",
            "topic": "Classes and Objects"
        },
        {
            "question": "What role do constructors play in classes?",
            "answer": "Constructors initialize new objects.",
            "ai_answer": "They set up the initial state of an object when it is created.",
            "week": "Week2",
            "topic": "Classes and Objects"
        },
        # Week 4 - Arrays and Strings
        {
            "question": "What is the difference between String and StringBuilder in Java?",
            "answer": "String is immutable, meaning once created it cannot be changed. StringBuilder is mutable and more efficient for string manipulation.",
            "ai_answer": "String creates a new object for each modification, while StringBuilder modifies the same object, making it more memory efficient for frequent changes.",
            "week": "Week4",
            "topic": "Arrays and Strings"
        },
        # Week 5 - Inheritance and Polymorphism
        {
            "question": "Explain the concept of inheritance in OOSD.",
            "answer": "Inheritance allows one class to acquire the properties and methods of another class.",
            "ai_answer": "It enables code reuse and establishes an 'is-a' relationship between classes.",
            "week": "Week5",
            "topic": "Inheritance and Polymorphism"
        },
        {
            "question": "Define polymorphism with an example.",
            "answer": "Polymorphism allows methods to have different implementations, e.g., method overriding.",
            "ai_answer": "It lets the same method call behave differently depending on the object type.",
            "week": "Week5",
            "topic": "Inheritance and Polymorphism"
        },
        # Week 6 - Interfaces and Polymorphism
        {
            "question": "What is the difference between an abstract class and an interface in Java?",
            "answer": "Abstract classes can have implemented methods, while interfaces cannot (before Java 8).",
            "ai_answer": "Interfaces define contracts; abstract classes can provide partial implementation.",
            "week": "Week6",
            "topic": "Interfaces and Polymorphism"
        },
        # Week 8 - Generics
        {
            "question": "Explain type erasure in Java Generics.",
            "answer": "Type erasure is the process by which the compiler removes all generic type information during compilation, replacing it with Object or bounded types.",
            "ai_answer": "It ensures backward compatibility with pre-generic Java code by converting generic types to their raw forms at compile time.",
            "week": "Week8",
            "topic": "Generics"
        },
        # Week 9 - Design Patterns
        {
            "question": "Describe the Observer design pattern and when to use it.",
            "answer": "The Observer pattern defines a one-to-many dependency where when one object changes state, all dependents are notified automatically.",
            "ai_answer": "It's useful for implementing event handling systems and maintaining consistency between related objects.",
            "week": "Week9",
            "topic": "Design Patterns"
        },
        # Week 10 - Exceptions
        {
            "question": "What is the difference between checked and unchecked exceptions in Java?",
            "answer": "Checked exceptions must be declared or caught at compile time, while unchecked exceptions (runtime exceptions) don't need to be explicitly handled.",
            "ai_answer": "Checked exceptions are verified at compile time and include IOException, SQLException, etc. Unchecked exceptions extend RuntimeException.",
            "week": "Week10",
            "topic": "Exceptions"
        },
        # Week 12 - Advanced Java
        {
            "question": "Explain how lambda expressions improve code readability in Java.",
            "answer": "Lambda expressions provide a concise way to represent anonymous functions, reducing boilerplate code for functional interfaces.",
            "ai_answer": "They enable functional programming style, making code more expressive and easier to read, especially when working with collections and streams.",
            "week": "Week12",
            "topic": "Advanced Java"
        },
    ]

    for q in short_questions:
        base_q = Question.objects.create(
            id=uuid.uuid4(),
            question=q["question"],
            creator=bob,
            source="STUDENT",
            type="SHORT",
            week=q.get("week", ""),
            topic=q.get("topic", ""),
        )
        ShortAnswerQuestion.objects.create(
            question=base_q,
            answer=q["answer"],
            ai_answer=q["ai_answer"],
        )


def delete_initial_questions(apps, schema_editor):
    Question = apps.get_model("questions", "Question")
    Question.objects.filter(title__startswith="OOSD").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("questions", "0001_initial"),
        ("user", "0002_default_user"),
    ]

    operations = [
        migrations.RunPython(create_initial_questions, delete_initial_questions),
    ]