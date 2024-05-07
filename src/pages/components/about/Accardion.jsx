import React from 'react'

function Accardion({ content, isOpen, onToggle, name }) {
    return (
        <section className="accardion">
            <div className="container">
                <div className="accardion-content">
                    <div className="accardion-box" onClick={onToggle}>
                        <div className="accardion-items">
                            <span className='accardion-name'>{name}</span>
                            <button className={isOpen ? 'accardion-button active' : "accardion-button"}>+</button>
                        </div>
                        <div className="accardion-text">
                            <p className={isOpen ? "accardion-body show" : "accardion-body"}>{content}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Accardion