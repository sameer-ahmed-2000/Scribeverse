import { useNavigate } from "react-router-dom"

export function Header() {
    const navigate = useNavigate()
    const handleClick = async () => {
        try {
            navigate('/main');
        } catch (error) {
            console.error('Error while redirecting:', error);
        }
    };
    return (
        <nav className="grid grid-cols-9 flex justify-between items-center shadow-md">
            <div className="col-span-5 flex px-6">
                <button className="text-2xl font-serif font-bold " onClick={() => handleClick()}>
                    Scribeverse
                </button>
                <div className="px-4 py-2 flex justify-between">
                    <div className="relative">
                        <input
                            type="text"
                            className="rounded-full pl-10 pr-10 py-2 border border-gray-300 focus:outline-0"
                            placeholder="Search"

                        />
                        <div className="absolute inset-y-0 pl-3 flex items-center">
                            <svg
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M17 17L21 21"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                                <path
                                    d="M3 11C3 15.4183 6.58172 19 11 19C13.213 19 15.2161 18.1015 16.6644 16.6493C18.1077 15.2022 19 13.2053 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11Z"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pl-96 col-span-4 flex justify-between ">
                <button className="flex">
                    <svg className="w-6 h-6" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" stroke-width="3" stroke="#808080" fill="none">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                            <path d="M55.5,23.9V53.5a2,2,0,0,1-2,2h-43a2,2,0,0,1-2-2v-43a2,2,0,0,1,2-2H41.64"></path>
                            <path d="M19.48,38.77l-.64,5.59a.84.84,0,0,0,.92.93l5.56-.64a.87.87,0,0,0,.5-.24L54.9,15.22a1.66,1.66,0,0,0,0-2.35L51.15,9.1a1.67,1.67,0,0,0-2.36,0L19.71,38.28A.83.83,0,0,0,19.48,38.77Z"></path>
                            <line x1="44.87" y1="13.04" x2="50.9" y2="19.24"></line>
                        </g>
                    </svg><div className="text-gray-600 px-2 text-sm pt-0.5">Write</div>
                </button>

            </div>
        </nav>
    )


}