import React, {useEffect, useState} from 'react';
import {Form} from 'semantic-ui-react';
import axios from 'axios';
import {useTranslation} from "react-i18next";

const FilterOptionSemester = ({withSpecial, widthSize, eventHandler}) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [semestersOptions, setSemestersOptions] = useState([]);
    const [semester, setSemester] = useState();

    useEffect(() => {
        setLoading(true);
        axios.get('/semesters' + (withSpecial ? "?special=1" : "")).then((response) => {
            if (response.status >= 200 && response.status < 300) {
                response.data.data.unshift({value: '', text: t("Todos os Semestres")});
                setSemestersOptions(response.data.data);
                setLoading(false);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filterBySemester = (e, {value}) => {
        setSemester(value);
        eventHandler(value);
    };

    return (
        <Form.Dropdown selectOnBlur={false} width={widthSize} selection value={semester} options={semestersOptions} label={t("Semestre")} placeholder={t("Todas os Semestres")} loading={loading} onChange={filterBySemester}/>
    );
};

export default FilterOptionSemester;
