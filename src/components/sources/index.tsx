export { default as Main } from './components/main';
export { default as Sidebar } from './components/sidebar';
import Main from './components/main';
import Sidebar from './components/sidebar';
import React from 'react';
import { useState, useEffect } from 'react'
import { Navigation } from "nde-design-system";

const SourcesUI = () => {

    const [sourceData, setSourceData] = useState({})
    const [ready, setReady] = useState(false)

    const sourceURL = 'https://api.data.niaid.nih.gov/v1/metadata/'

    const getSourcesData = async () => {
        const response = await fetch(sourceURL)
        const jsonData = await response.json()
        setSourceData(jsonData)
    }


    useEffect(() => {
        getSourcesData()
    }, [])

    useEffect(() => {
        if (Object.keys(sourceData).length > 0) setReady(true)
    }, [sourceData])

    return (
        <>
            {ready &&
                <>
                    <Navigation />
                    <div className="min-h-screen flex flex-row">
                        <div className="flex flex-col bg-gray-100  text-white w-6/12 hidden md:block">
                            <ul className="flex flex-col py-4 sticky top-0 divide-gray-400">
                                <Sidebar sourceData={sourceData} />
                            </ul>
                        </div>
                        <div className=" text-center md:text-left">
                            <Main sourceData={sourceData} />
                        </div>
                    </div>
                </>
            }
        </>
    );
};

export default SourcesUI;
