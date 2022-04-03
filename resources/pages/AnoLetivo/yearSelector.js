import React from 'react';
import {useTranslation} from "react-i18next";
import moment from "moment";

const YearSelector = (yearChange) => {
    const { t } = useTranslation();
    const academicYears = [
        moment(new Date()).add(-2, 'year').format('YYYY') + "-" + moment(new Date()).add(-1, 'year').format('YY'),
        moment(new Date()).add(-1, 'year').format('YYYY') + "-" + moment(new Date()).format('YY'),
        moment(new Date()).format('YYYY') + "-" + moment(new Date()).add(1, 'year').format('YY'),
        moment(new Date()).add(1, 'year').format('YYYY') + "-" + moment(new Date()).add(2, 'year').format('YY'),
        moment(new Date()).add(2, 'year').format('YYYY') + "-" + moment(new Date()).add(3, 'year').format('YY')
    ];
    const handleYearChange = (event) => {
        yearChange.yearChange(event.target.value);
    }

    return (
        <div>
            { t('ano_letivo.Ao abrir um novo ano letivo, este ficará ativo por defeito para todos os utilizadores!') }
            <br/><strong> { t('ano_letivo.Tem a certeza que deseja abrir um novo ano letivo com o seguinte código?') }</strong>
            <br/><br/>
            { academicYears.map((element) => (
                <div className="field" key={element}>
                    <div className="ui radio checkbox">
                        <input type="radio" className="hidden" value={ element } id={"radio_year_" + element } name="radio_year" onChange={handleYearChange} />
                        <label htmlFor={"radio_year_" + element}>{element}</label>
                    </div>
                </div>
            ))}
        </div>
    )
};

export default YearSelector;
