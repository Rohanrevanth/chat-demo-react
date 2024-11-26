import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react';
import Image from "next/image";
import { API_URL } from '../global';

export default function Page({ selectUser } : any) {

    const router = useRouter()

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    useEffect(() => {
      const user = localStorage.getItem('user');
      if(user) {
        var user_ = JSON.parse(user)
        setUsername(user_.username)
      }

      // Event listener to close dropdown on Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setShowDropdown(false);
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    function logoutClick() {
      localStorage.clear()
      router.push('/')
    }

    async function handleSearchChange(e : any) {
      const value = e.target.value;

      setSearchTerm(value);

      if (value) {
        try {
          const response = await fetch(API_URL + '/publicusers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
     
          if (!response.ok) {
            throw new Error('Failed to get users data. Please try again.')
          }
     
          var results = await response.json();
          results = results.filter((item : any) =>
            item.username.toLowerCase().includes(value.toLowerCase()) || item.email.toLowerCase().includes(value.toLowerCase())
          );
          setSearchResults(results);
          setShowDropdown(true);

        } catch (error : any) {
          console.error(error)
        }

      } else {
        setShowDropdown(false); // Close dropdown when searchTerm is empty
      }
    };

    function handleResultClick(result: any) {
      console.log('Clicked:', result);
      setSearchTerm("");
      selectUser(result);
      setShowDropdown(false);
    };

    function handleNotificationClick() {
      console.log("to be developed!")
    }

    return (
      <div className="p-5 w-full bg-neutral-900 flex justify-between items-center">
        <div className="flex items-center flex-1">
          <p className="text-white mr-5">Welcome, {username}</p>

          {/* Full-Width Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search..."
              className="p-2 w-full rounded bg-neutral-800 text-white focus:outline-none"
            />

            {/* Dropdown for search results */}
            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white text-black rounded shadow-lg z-10 max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-neutral-300 cursor-pointer flex justify-between"
                      onClick={() => handleResultClick(result)}
                    >
                      <div>
                        <div>
                          <strong>{result.username}</strong>
                        </div>
                        <div className="text-gray-500">{result.email}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No results found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="flex items-center ml-5">
          <Image
            onClick={logoutClick}
            style={{ cursor: 'pointer' }}
            className="dark:invert"
            src="https://www.svgrepo.com/show/507772/logout.svg"
            alt="logout"
            width={40}
            height={40}
          />
        </div>
      </div>
    );
}
