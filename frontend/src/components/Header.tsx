import { useNavigate } from "react-router-dom"

export function Header(){
    const navigate = useNavigate()
    const handleClick = async () => {
        try {
            navigate('/main');
        } catch (error) {
            console.error('Error while redirecting:', error);
        }
    };
    return(
        <nav className="flex justify-between items-center p-4 shadow-md">
            <button className="text-2xl font-serif font-bold " onClick={()=>handleClick()}>
                Scribeverse
            </button>

        </nav>
    )
        
    
}