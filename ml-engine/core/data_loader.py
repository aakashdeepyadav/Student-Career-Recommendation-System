"""
Data Loader
Loads and manages career and student datasets.
"""

import json
import numpy as np
import pandas as pd
from typing import List, Dict, Optional
import os


class DataLoader:
    """
    Loads career and student datasets.
    """
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
    
    def load_careers(self, filepath: Optional[str] = None) -> List[Dict]:
        """
        Load career dataset.
        
        Args:
            filepath: Path to careers JSON file (optional)
        
        Returns:
            List of career dictionaries
        """
        if filepath is None:
            filepath = os.path.join(self.data_dir, "careers.json")
        
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            # Return default careers if file doesn't exist
            return self._get_default_careers()
    
    def load_students(self, filepath: Optional[str] = None) -> List[Dict]:
        """
        Load student dataset.
        
        Args:
            filepath: Path to students JSON file (optional)
        
        Returns:
            List of student dictionaries
        """
        if filepath is None:
            filepath = os.path.join(self.data_dir, "students.json")
        
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            return []
    
    def save_careers(self, careers: List[Dict], filepath: Optional[str] = None):
        """Save careers to JSON file."""
        if filepath is None:
            filepath = os.path.join(self.data_dir, "careers.json")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(careers, f, indent=2, ensure_ascii=False)
    
    def save_students(self, students: List[Dict], filepath: Optional[str] = None):
        """Save students to JSON file."""
        if filepath is None:
            filepath = os.path.join(self.data_dir, "students.json")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(students, f, indent=2, ensure_ascii=False)
    
    def _get_default_careers(self) -> List[Dict]:
        """Get default career dataset with salaries in Indian Rupees (INR)."""
        return [
            {
                "id": "career_1",
                "title": "Software Engineer",
                "description": "Design and develop software applications, write code, debug programs, and maintain systems.",
                "riasec": [0.2, 0.8, 0.3, 0.2, 0.4, 0.5],
                "skills": ["Programming", "Problem Solving", "Algorithms", "Data Structures"],
                "skills_vector": [0.9, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1],
                "domain": "Tech/Analytical",
                "salary_range": "₹6,00,000 - ₹25,00,000"
            },
            {
                "id": "career_2",
                "title": "Data Scientist",
                "description": "Analyze complex data, build machine learning models, and extract insights from data.",
                "riasec": [0.1, 0.9, 0.2, 0.3, 0.4, 0.6],
                "skills": ["Statistics", "Machine Learning", "Python", "Data Analysis"],
                "skills_vector": [0.8, 0.9, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2],
                "domain": "Tech/Analytical",
                "salary_range": "₹8,00,000 - ₹30,00,000"
            },
            {
                "id": "career_3",
                "title": "UX Designer",
                "description": "Design user interfaces and experiences, conduct user research, and create prototypes.",
                "riasec": [0.2, 0.4, 0.9, 0.6, 0.5, 0.3],
                "skills": ["Design", "User Research", "Prototyping", "Creativity"],
                "skills_vector": [0.7, 0.6, 0.5, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3],
                "domain": "Creative",
                "salary_range": "₹5,00,000 - ₹18,00,000"
            },
            {
                "id": "career_4",
                "title": "Business Analyst",
                "description": "Analyze business processes, identify improvements, and bridge business and technology.",
                "riasec": [0.3, 0.5, 0.2, 0.4, 0.8, 0.7],
                "skills": ["Analysis", "Communication", "Business Acumen", "Problem Solving"],
                "skills_vector": [0.6, 0.7, 0.6, 0.5, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3],
                "domain": "Business/Leadership",
                "salary_range": "₹5,00,000 - ₹15,00,000"
            },
            {
                "id": "career_5",
                "title": "Teacher",
                "description": "Educate students, develop curriculum, and foster learning environments.",
                "riasec": [0.2, 0.4, 0.5, 0.9, 0.3, 0.6],
                "skills": ["Communication", "Patience", "Subject Knowledge", "Teaching"],
                "skills_vector": [0.5, 0.6, 0.5, 0.4, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4],
                "domain": "Social/People",
                "salary_range": "₹3,00,000 - ₹8,00,000"
            },
            {
                "id": "career_6",
                "title": "Mechanical Engineer",
                "description": "Design mechanical systems, analyze problems, and create solutions for manufacturing.",
                "riasec": [0.9, 0.7, 0.3, 0.2, 0.4, 0.6],
                "skills": ["Engineering", "CAD", "Problem Solving", "Mathematics"],
                "skills_vector": [0.8, 0.7, 0.6, 0.5, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4],
                "domain": "Practical/Realistic",
                "salary_range": "₹4,00,000 - ₹12,00,000"
            },
            {
                "id": "career_7",
                "title": "Marketing Manager",
                "description": "Develop marketing strategies, manage campaigns, and analyze market trends.",
                "riasec": [0.3, 0.4, 0.6, 0.5, 0.9, 0.7],
                "skills": ["Marketing", "Communication", "Analytics", "Strategy"],
                "skills_vector": [0.6, 0.7, 0.6, 0.5, 0.8, 0.9, 0.7, 0.6, 0.5, 0.4],
                "domain": "Business/Leadership",
                "salary_range": "₹6,00,000 - ₹20,00,000"
            },
            {
                "id": "career_8",
                "title": "Psychologist",
                "description": "Study human behavior, provide therapy, and conduct psychological research.",
                "riasec": [0.1, 0.7, 0.3, 0.9, 0.2, 0.5],
                "skills": ["Psychology", "Communication", "Research", "Empathy"],
                "skills_vector": [0.5, 0.6, 0.5, 0.4, 0.7, 0.9, 0.8, 0.7, 0.6, 0.5],
                "domain": "Social/People",
                "salary_range": "₹4,00,000 - ₹12,00,000"
            },
            {
                "id": "career_9",
                "title": "Graphic Designer",
                "description": "Create visual designs, develop brand identities, and design marketing materials.",
                "riasec": [0.2, 0.3, 0.9, 0.4, 0.5, 0.4],
                "skills": ["Design", "Creativity", "Software Tools", "Visual Communication"],
                "skills_vector": [0.6, 0.5, 0.4, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3],
                "domain": "Creative",
                "salary_range": "₹3,00,000 - ₹10,00,000"
            },
            {
                "id": "career_10",
                "title": "Financial Analyst",
                "description": "Analyze financial data, create reports, and provide investment recommendations.",
                "riasec": [0.2, 0.6, 0.2, 0.3, 0.7, 0.9],
                "skills": ["Finance", "Analysis", "Excel", "Mathematics"],
                "skills_vector": [0.7, 0.8, 0.7, 0.6, 0.5, 0.9, 0.8, 0.7, 0.6, 0.5],
                "domain": "Business/Leadership",
                "salary_range": "₹5,00,000 - ₹18,00,000"
            },
            {
                "id": "career_11",
                "title": "Web Developer",
                "description": "Build and maintain websites, create web applications, and ensure optimal user experience.",
                "riasec": [0.3, 0.7, 0.4, 0.3, 0.5, 0.6],
                "skills": ["Programming", "Web Technologies", "HTML/CSS", "JavaScript"],
                "skills_vector": [0.9, 0.8, 0.7, 0.6, 0.5, 0.7, 0.6, 0.5, 0.4, 0.3],
                "domain": "Tech/Analytical",
                "salary_range": "₹4,00,000 - ₹15,00,000"
            },
            {
                "id": "career_12",
                "title": "Product Manager",
                "description": "Lead product development, coordinate teams, and define product strategy and roadmap.",
                "riasec": [0.2, 0.5, 0.4, 0.5, 0.9, 0.6],
                "skills": ["Leadership", "Strategy", "Communication", "Product Development"],
                "skills_vector": [0.6, 0.7, 0.6, 0.5, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4],
                "domain": "Business/Leadership",
                "salary_range": "₹10,00,000 - ₹35,00,000"
            },
            {
                "id": "career_13",
                "title": "Nurse",
                "description": "Provide patient care, administer medications, and support healthcare teams.",
                "riasec": [0.4, 0.5, 0.2, 0.9, 0.3, 0.7],
                "skills": ["Medical Knowledge", "Empathy", "Communication", "Attention to Detail"],
                "skills_vector": [0.5, 0.6, 0.5, 0.4, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4],
                "domain": "Social/People",
                "salary_range": "₹2,50,000 - ₹6,00,000"
            },
            {
                "id": "career_14",
                "title": "Architect",
                "description": "Design buildings and structures, create blueprints, and oversee construction projects.",
                "riasec": [0.6, 0.7, 0.9, 0.4, 0.5, 0.6],
                "skills": ["Design", "CAD", "Mathematics", "Creativity"],
                "skills_vector": [0.7, 0.6, 0.5, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3],
                "domain": "Creative",
                "salary_range": "₹5,00,000 - ₹20,00,000"
            },
            {
                "id": "career_15",
                "title": "Accountant",
                "description": "Prepare financial records, analyze accounts, and ensure compliance with regulations.",
                "riasec": [0.2, 0.5, 0.2, 0.3, 0.5, 0.9],
                "skills": ["Accounting", "Mathematics", "Attention to Detail", "Excel"],
                "skills_vector": [0.6, 0.7, 0.6, 0.5, 0.4, 0.9, 0.8, 0.7, 0.6, 0.5],
                "domain": "Business/Leadership",
                "salary_range": "₹3,00,000 - ₹10,00,000"
            },
            {
                "id": "career_16",
                "title": "Research Scientist",
                "description": "Conduct scientific research, perform experiments, and publish findings.",
                "riasec": [0.2, 0.9, 0.3, 0.4, 0.3, 0.6],
                "skills": ["Research", "Analytical Thinking", "Statistics", "Problem Solving"],
                "skills_vector": [0.7, 0.9, 0.8, 0.7, 0.6, 0.9, 0.8, 0.7, 0.6, 0.5],
                "domain": "Tech/Analytical",
                "salary_range": "₹5,00,000 - ₹15,00,000"
            },
            {
                "id": "career_17",
                "title": "Social Worker",
                "description": "Help individuals and families cope with challenges, provide counseling and support.",
                "riasec": [0.2, 0.4, 0.3, 0.9, 0.2, 0.5],
                "skills": ["Empathy", "Communication", "Counseling", "Problem Solving"],
                "skills_vector": [0.4, 0.5, 0.4, 0.3, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4],
                "domain": "Social/People",
                "salary_range": "₹2,50,000 - ₹6,00,000"
            },
            {
                "id": "career_18",
                "title": "Electrical Engineer",
                "description": "Design electrical systems, develop circuits, and solve technical problems.",
                "riasec": [0.7, 0.8, 0.3, 0.2, 0.4, 0.6],
                "skills": ["Engineering", "Mathematics", "Problem Solving", "Technical Skills"],
                "skills_vector": [0.8, 0.8, 0.7, 0.6, 0.5, 0.9, 0.8, 0.7, 0.6, 0.5],
                "domain": "Practical/Realistic",
                "salary_range": "₹4,00,000 - ₹14,00,000"
            },
            {
                "id": "career_19",
                "title": "Content Writer",
                "description": "Create written content for websites, blogs, and marketing materials.",
                "riasec": [0.2, 0.4, 0.9, 0.5, 0.4, 0.5],
                "skills": ["Writing", "Creativity", "Communication", "Research"],
                "skills_vector": [0.5, 0.6, 0.5, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3],
                "domain": "Creative",
                "salary_range": "₹2,50,000 - ₹8,00,000"
            },
            {
                "id": "career_20",
                "title": "Project Manager",
                "description": "Plan and execute projects, manage teams, and ensure timely delivery.",
                "riasec": [0.3, 0.5, 0.3, 0.5, 0.9, 0.8],
                "skills": ["Leadership", "Planning", "Communication", "Organization"],
                "skills_vector": [0.6, 0.7, 0.6, 0.5, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4],
                "domain": "Business/Leadership",
                "salary_range": "₹8,00,000 - ₹25,00,000"
            },
            {
                "id": "career_21",
                "title": "Cybersecurity Analyst",
                "description": "Protect systems from cyber threats, monitor security, and respond to incidents.",
                "riasec": [0.3, 0.8, 0.2, 0.2, 0.4, 0.7],
                "skills": ["Security", "Problem Solving", "Analytical Thinking", "Technical Skills"],
                "skills_vector": [0.8, 0.9, 0.8, 0.7, 0.6, 0.9, 0.8, 0.7, 0.6, 0.5],
                "domain": "Tech/Analytical",
                "salary_range": "₹6,00,000 - ₹22,00,000"
            },
            {
                "id": "career_22",
                "title": "Human Resources Manager",
                "description": "Manage recruitment, employee relations, and organizational development.",
                "riasec": [0.2, 0.4, 0.3, 0.8, 0.7, 0.8],
                "skills": ["Communication", "Leadership", "Organization", "People Skills"],
                "skills_vector": [0.5, 0.6, 0.5, 0.4, 0.8, 0.9, 0.8, 0.7, 0.6, 0.5],
                "domain": "Social/People",
                "salary_range": "₹5,00,000 - ₹18,00,000"
            },
            {
                "id": "career_23",
                "title": "Civil Engineer",
                "description": "Design infrastructure projects, plan construction, and ensure safety standards.",
                "riasec": [0.8, 0.7, 0.3, 0.3, 0.5, 0.7],
                "skills": ["Engineering", "Mathematics", "Problem Solving", "Project Management"],
                "skills_vector": [0.8, 0.7, 0.6, 0.5, 0.8, 0.9, 0.8, 0.7, 0.6, 0.5],
                "domain": "Practical/Realistic",
                "salary_range": "₹4,00,000 - ₹15,00,000"
            },
            {
                "id": "career_24",
                "title": "Video Game Designer",
                "description": "Create game concepts, design gameplay mechanics, and develop interactive experiences.",
                "riasec": [0.3, 0.6, 0.9, 0.4, 0.5, 0.4],
                "skills": ["Creativity", "Design", "Programming", "Problem Solving"],
                "skills_vector": [0.7, 0.6, 0.5, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3],
                "domain": "Creative",
                "salary_range": "₹4,00,000 - ₹16,00,000"
            },
            {
                "id": "career_25",
                "title": "Operations Manager",
                "description": "Oversee daily operations, optimize processes, and manage resources efficiently.",
                "riasec": [0.5, 0.6, 0.3, 0.4, 0.9, 0.8],
                "skills": ["Leadership", "Operations", "Problem Solving", "Organization"],
                "skills_vector": [0.6, 0.7, 0.6, 0.5, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4],
                "domain": "Business/Leadership",
                "salary_range": "₹6,00,000 - ₹20,00,000"
            }
        ]

