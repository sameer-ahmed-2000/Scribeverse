import React, { useState, useEffect, FC } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const interestsList: string[] = [
    "Programming", "Writing", "Politics", "Data Science", "Psychology", "Python",
    "Relationships", "Cryptocurrency", "Health", "Technology", "Machine Learning",
    "Science", "Self Improvement", "Productivity", "Money", "Mental Health",
    "Business", "Life", "Software Development", "Startup", "Design", "JavaScript",
    "Entrepreneurship", "Humor", "React", "Education", "Web Development",
    "Deep Learning", "Artificial Intelligence", "Coding", "History", "Society",
    "Culture", "Software Engineering", "UX", "Work", "Blockchain", "Marketing",
    "Books", "Lifestyle", "NFT", "Social Media", "Leadership", "Android", "Women",
    "Mindfulness", "Apple", "Sexuality", "Fitness", "Creativity", "Philosophy",
    "Ethereum", "AWS", "Node.js", "NLP", "Flutter", "UI", "UX Design", "DeFi",
    "Economics", "Spirituality", "This Happened To Me", "World", "Equality",
    "Future", "Climate Change", "Java", "Product Management", "Freelancing",
    "Cybersecurity", "Religion", "Parenting", "TypeScript", "Art", "Travel",
    "Language", "Media", "Nonfiction", "Family", "Venture Capital", "Gaming",
    "Docker", "Data Visualization", "Bitcoin", "True Crime", "Fiction", "Poetry",
    "Space", "Race", "DevOps", "Feminism", "iOS", "Web3", "Kubernetes", "Food",
    "Sports", "Math", "Photography", "Music", "Justice", "Data Engineering",
    "Film", "Angular"
];

const InterestSelector: FC = () => {
    const navigate = useNavigate();
    const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set<string>());
    const [error, setError] = useState<string | null>(null);
    const handleButtonClick = (interest: string) => {
        setSelectedInterests(prev => {
            const updated = new Set(prev);
            if (updated.has(interest)) {
                updated.delete(interest);
            } else {
                updated.add(interest);
            }
            return updated;
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const data = {
            add: Array.from(selectedInterests),
        };
        try {
            const response = await axios.post('http://127.0.0.1:8787/api/v1/update/update-interests', data);
            alert('Interests updated successfully!');
            navigate('/main');
        } catch (error) {
            console.error('Error updating interests:', error);
            alert('Failed to update interests');
        }
    };

    return (
        <form onSubmit={handleSubmit} className='p-2'>
            <h2 className="text-center text-2xl font-bold mb-4">Select Your Interests</h2>
            <h4 className="text-center text-l font-bold mb-4">Select three or more to proceed</h4>
            <div className='flex flex-wrap gap-2 '>
                {interestsList.map((interest) => (
                    <button
                        key={interest}
                        type="button"
                        onClick={() => handleButtonClick(interest)}
                        className={`flex justify-around px-4 py-2 rounded-full border-2 border-gray-300 ${
                            selectedInterests.has(interest) ? 'bg-gray-800 text-white' : 'bg-white'
                        }`}
                    >
                        {interest}{!selectedInterests.has(interest) && <span className="ml-2">+</span>}
                    </button>
                ))}
            </div>
            {/* <div className="flex justify-center mt-4">
                <button type="submit" className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-full">Update Interests</button>
            </div> */}
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            <div className="flex justify-center mt-4">
                <button
                    type="submit"
                    className={`px-6 py-2 rounded-full text-white ${selectedInterests.size >= 3 ? 'bg-gray-800 hover:bg-gray-600' : 'bg-red-400 cursor-not-allowed'}`}
                    disabled={selectedInterests.size < 3}
                >
                    Update Interests
                </button>
            </div>
            
        </form>
    );
};

export default InterestSelector;
