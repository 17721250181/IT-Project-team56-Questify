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

    # 5 MCQ questions created by Alice
    mcq_questions = [
        {
            "question": "Which of the following is NOT a principle of OOSD?",
            "options": ["Encapsulation", "Inheritance", "Polymorphism", "Recursion", "Abstraction"],
            "correct": ["D"],
        },
        {
            "question": "In UML, which diagram is used to model class structure?",
            "options": ["Sequence Diagram", "Class Diagram", "Use Case Diagram", "State Diagram", "Activity Diagram"],
            "correct": ["B"],
        },
        {
            "question": "Which keyword in Java is used to achieve inheritance?",
            "options": ["extends", "implements", "super", "class", "this"],
            "correct": ["A"],
        },
        {
            "question": "Polymorphism in OOSD allows:",
            "options": [
                "Multiple classes to have the same name",
                "Objects to take many forms",
                "Data hiding",
                "Code duplication",
                "Overloading only",
            ],
            "correct": ["B"],
        },
        {
            "question": "Which of these best describes encapsulation?",
            "options": [
                "Bundling data and methods together",
                "Defining multiple constructors",
                "Overriding methods",
                "Using interfaces",
                "Separating UI and logic",
            ],
            "correct": ["A"],
        },
    ]

    for q in mcq_questions:
        base_q = Question.objects.create(
            id=uuid.uuid4(),
            question=q["question"],
            creator=alice,
            source="STUDENT",
            type="MCQ",
            week="Week 5",
            topic="OOSD Basics",
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

    # 5 short answer created by Bob
    short_questions = [
        {
            "question": "Explain the concept of inheritance in OOSD.",
            "answer": "Inheritance allows one class to acquire the properties and methods of another class.",
            "ai_answer": "It enables code reuse and establishes an 'is-a' relationship between classes.",
        },
        {
            "question": "What is the difference between an abstract class and an interface in Java?",
            "answer": "Abstract classes can have implemented methods, while interfaces cannot (before Java 8).",
            "ai_answer": "Interfaces define contracts; abstract classes can provide partial implementation.",
        },
        {
            "question": "Define polymorphism with an example.",
            "answer": "Polymorphism allows methods to have different implementations, e.g., method overriding.",
            "ai_answer": "It lets the same method call behave differently depending on the object type.",
        },
        {
            "question": "Why is encapsulation important in OOSD?",
            "answer": "It hides internal implementation details and exposes only necessary parts.",
            "ai_answer": "Encapsulation improves maintainability, security, and modularity.",
        },
        {
            "question": "What role do constructors play in classes?",
            "answer": "Constructors initialize new objects.",
            "ai_answer": "They set up the initial state of an object when it is created.",
        },
    ]

    for q in short_questions:
        base_q = Question.objects.create(
            id=uuid.uuid4(),
            question=q["question"],
            creator=bob,
            source="STUDENT",
            type="SHORT",
            week="Week 6",
            topic="OOSD Classes",
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