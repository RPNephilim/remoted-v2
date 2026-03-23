import { createContext, useEffect, useRef, useState, type ReactNode } from 'react';

export interface DeviceType {
    deviceName: string;
    lastUsed: string;
    dateAdded: string;
    active: boolean;
}

export interface UserContextType {
    user: {
        username: string;
        email?: string;
        devices: DeviceType[]
    } | null;
    updateUser: (newUser: UserContextType["user"]) => void;
    getUser: () => UserContextType["user"] | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider = ({ children }: { children: ReactNode }) => {
    // const [user, setUser] = useState<UserContextType["user"] | null>(null);
    const [user, setUser] = useState<UserContextType["user"] | null>({
        username: 'user1',
        email: 'user1@example.com',
        // devices: []
        devices: [{
            deviceName: 'device1',
            lastUsed: 'Current Device',
            dateAdded: '2026-01-20',
            active: true
        },
        {
            deviceName: 'device2',
            lastUsed: '2026-02-10',
            dateAdded: '2026-01-25',
            active: true
        }]
    });

    const userRef = useRef(user);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    

    const updateUser = (newUser: UserContextType["user"]) => {
        userRef.current = newUser;
        setUser(newUser);
        console.log("Updated user data: ", newUser);
    }

    const getUser = () => {
        return userRef.current;
    }

    return (
        <UserContext.Provider value={{ user, updateUser, getUser }}>
            {children}
        </UserContext.Provider>
    )
}

export { UserContext, UserProvider };

