import React from "react";
import {Pagination} from "semantic-ui-react";
import {useTranslation} from "react-i18next";

const PaginationDetail = ({info, currentPage = 1, eventHandler}) => {
    const { t } = useTranslation();

    const updatePages = (evt, {activePage}) => {
        eventHandler(activePage);
    };

    return (
        <div>
            { info && (
                <div>
                    <div> { t('Desde') } <b>{ info.from }</b> { t('até') }  <b>{ info.to }</b> { t('de') } <b>{ info.total }</b> { t('resultados') }</div>
                    <br/>
                    { info.current_page !== info.last_page && (
                        <Pagination activePage={currentPage} totalPages={info.last_page} onPageChange={updatePages} firstItem={null} lastItem={null} />
                    )}
                </div>
                )
            }
        </div>
    );
};

export default PaginationDetail;
