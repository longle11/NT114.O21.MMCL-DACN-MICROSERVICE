import React from 'react'

export default function SearchModal() {
    return (
        <div className="modal fade" id="searchModal" tabIndex={-1} role="dialog" aria-labelledby="searchModal" aria-hidden="true">
            <div className="modal-dialog modal-search">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="search-block">
                            <input className="search" />
                            <i className="fa fa-search" />
                        </div>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <p>RECENT ISSUES</p>
                        <div style={{ display: 'flex' }}>
                            <div className="icon">
                                <i className="fa fa-bookmark" />
                            </div>
                            <div>
                                <p>cyberlearn</p>
                                <p>BUG-238066</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
