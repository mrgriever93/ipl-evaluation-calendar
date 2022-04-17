import React, {useEffect, useState} from 'react';
import {Form} from 'semantic-ui-react';
import axios from 'axios';
import {useTranslation} from "react-i18next";
import _ from "lodash";

const FilterOptionCourse = ({widthSize, eventHandler}) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [coursesOptions, setCoursesOptions] = useState([]);
    const [course, setCourse] = useState();

    const loadCourses = (search = '') => {
        setLoading(true);
        let link = '/courses-search';
        link += (search ? '?search=' + search : '');
        axios.get(link).then((res) => {
            if (res.status === 200) {
                res.data.data.unshift({value: '', text: t("Todos os Cursos")});
                setCoursesOptions(res.data.data);
                setLoading(false);
            }
        });
    };

    useEffect(() => {
        loadCourses();
    }, []);

    const handleSearchCourses = (evt, {searchQuery}) => {
        loadCourses(searchQuery);
    };

    const filterByCourse = (e, {value}) => {
        setCourse(value);
        eventHandler(value);
    };

    return (
        <Form.Dropdown selectOnBlur={false} width={widthSize} search clearable selection value={course} options={coursesOptions} label={t("Curso")} placeholder={t("Pesquisar o curso...")} loading={loading}
                       onSearchChange={_.debounce(handleSearchCourses, 400)}
                       onChange={filterByCourse}/>
    );
};

export default FilterOptionCourse;
