import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import { useHistory } from 'react-router';
import { DateInput, TimeInput } from 'semantic-ui-calendar-react';
import {
  Accordion,
  Button,
  Card,
  Container,
  Divider,
  Form,
  Grid,
  Header,
  Icon,
  List,
  Modal,
  Segment,
  Table,
  TextArea,
  Popup,
  Dropdown,
  Comment,
  Message,
} from 'semantic-ui-react';
import styled, { css } from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import PageLoader from '../../components/PageLoader';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import SCOPES from '../../utils/scopesConstants';
import { errorConfig, successConfig } from '../../utils/toastConfig';

const SweetAlertComponent = withReactContent(Swal);

const CellButton = styled.div`
    width: 100%;
    height: ${({ height }) => (height || '40px')};
    vertical-align: middle;
    text-align: center;
    cursor: pointer;
    color: ${({ color }) => color || 'transparent'};
    ${({ backgroundColor }) => (backgroundColor
    ? css`
                  background-color: ${backgroundColor};
              `
    : null)}
    ${({ fontSize }) => (fontSize
    ? css`
                  font-size: ${fontSize};
              `
    : css`
                  line-height: 40px;
              `)}
        ${({ margin }) => (margin
    ? css`
                  margin: ${margin};
              `
    : null)}
            ${({ isModified }) => (isModified
    ? css`
                  background-color: rgb(237, 170, 0);
              `
    : null)}
  &:hover {
        background-color: #dee2e6;
        color: black;
    }
`;

const LegendBox = styled.div`
    user-select: none;
    border-radius: 0.28571429rem;
    border: 1px solid rgba(34, 36, 38, 0.1);
    width: 140px;
    height: 50px;
    background-color: ${({ backgroundColor }) => backgroundColor};
    margin: 0 20px 20px 0;
    color: black;
    display: flex;
    align-content: center;
    align-items: center;
    justify-content: center;
`;

const EditExamButton = styled.div`
  position: absolute;
  left: 5px;

  &:hover {
    color: #edaa00;
  }
`;

const RemoveExamButton = styled.div`
    position: absolute;
    right: 0;
    &:hover {
      color: #db2828;
    }
`;

const Calendar = ({ match }) => {
  const [calendarPermissions, setCalendarPermissions] = useState(JSON.parse(localStorage.getItem('calendarPermissions')) || []);
  const history = useHistory();
  const [interruptionsList, setInterruptions] = useState([]);
  const [epochsList, setEpochs] = useState([]);
  const [generalInfo, setGeneralInfo] = useState();
  const [differences, setDifferences] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [interruptionTypes, setInterruptionTypesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalInfo, setModalInfo] = useState({});
  const [activeIndex, setActiveIndex] = useState(undefined);
  const [loadInterruptionTypes, setLoadInterruptionTypes] = useState(false);
  const [examInfoModal, setExamInfoModal] = useState({});
  const [openExamModal, setOpenExamModal] = useState(false);
  const [loadRemainingCourseUnits, setLoadRemainingCourseUnits] = useState(false);
  const [selectedEpoch, setSelectedEpoch] = useState();
  const [courseUnits, setCourseUnits] = useState(undefined);
  const [methodList, setMethodList] = useState(undefined);
  const [calendarPhases, setCalendarPhases] = useState([]);
  const [examList, setExamList] = useState([]);
  const [publishLoading, setPublishLoading] = useState(false);
  const [creatingCopy, setCreatingCopy] = useState(false);

  const [isTemporary, setIsTemporary] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [calendarPhase, setCalendarPhase] = useState(true);
  const [updatingCalendarPhase, setUpdatingCalendarPhase] = useState(false);
  const [removingExam, setRemovingExam] = useState(undefined);
  const [changeData, setChangeData] = useState(false);
  const [savingExam, setSavingExam] = useState(false);
  const [viewExamInformation, setViewExamInformation] = useState(false);
  const [showIgnoredComments, setShowIgnoredComments] = useState(false);
  const [commentText, setCommentText] = useState(undefined);
  const [previousFromDefinitive, setPreviousFromDefinitive] = useState(false);
  const [noMethods, setNoMethods] = useState(false);

  const addComment = (examId) => {
    axios.post('/comment/', {
      exam_id: examId,
      comment: commentText,
    }).then((res) => {
      if (res.status === 201) {
        toast('O comentário foi adicionado com sucesso!', successConfig);
      } else {
        toast('Ocorreu um erro ao adicionar o comentário!', errorConfig);
      }
    });
  };

  const calendarId = match.params?.id;

  const patchCalendar = (fieldToUpdate, value) => axios.patch(`/calendar/${calendarId}`, {
    [fieldToUpdate]: value,
  });

  const updateCalendarStatus = (newTemporaryStatus) => {
    patchCalendar('temporary', newTemporaryStatus).then((response) => {
      if (response.status === 200) {
        setIsTemporary(newTemporaryStatus);
        toast('Estado do calendário atualizado!', successConfig);
      }
    });
  };

  const updateCalendarPhase = (newCalendarPhase) => {
    setUpdatingCalendarPhase(true);
    patchCalendar('calendar_phase_id', newCalendarPhase).then(
      (response) => {
        setUpdatingCalendarPhase(false);
        if (response.status === 200) {
          setCalendarPhase(newCalendarPhase);
          toast('Fase do calendário atualizada!', successConfig);
        }
      },
    );
  };

  const ignoreComment = (commentId) => {
    axios.post(`/comment/${commentId}/ignore`).then((res) => {
      if (res.status === 200) {
        toast('Comentário ignorado com sucesso!', successConfig);
      } else {
        toast('Ocorreu um erro ao ignorar o comentário!', successConfig);
      }
    });
  };

  useEffect(() => {
    axios.get('/permissions/calendar').then((res) => {
      if (res.status === 200) {
        localStorage.setItem('calendarPermissions', JSON.stringify(res.data.data));
      }
    });
  }, []);

  const loadCalendar = (calId) => {
    setIsLoading(true);
    setExamList([]);
    axios
      .get(`/calendar/${calId}`)
      .then((response) => {
        if (response?.status >= 200 && response?.status < 300) {
          const {
            data: {
              data: {
                phase,
                published,
                interruptions,
                epochs,
                general_info,
                differences,
                previous_from_definitive,
              },
            },
          } = response;
          setIsTemporary(!!general_info?.temporary);
          setCalendarPhase(general_info?.phase?.id);
          setIsPublished(!!published);
          setInterruptions(interruptions);
          setEpochs(epochs);
          epochs.forEach((epoch) => {
            setExamList((current) => [...current, ...epoch.exams]);
          });
          setGeneralInfo(general_info);
          setDifferences(differences);
          setIsLoading(false);
          setPreviousFromDefinitive(previous_from_definitive);
        } else {
          history.push('/calendario');
        }
      })
      .catch((r) => alert(r));
  };

  const onSubmitInterruption = (values) => {
    const axiosFn = values?.id ? axios.patch : axios.post;
    axiosFn(`/interruptions/${values?.id ? values.id : ''}`, {
      calendar_id: parseInt(calendarId, 10),
      interruption_type_id: values.interruptionType,
      description: values.description,
      start_date: moment(values.startDate).format('YYYY-MM-DD'),
      end_date: moment(values.endDate).format('YYYY-MM-DD'),
    })
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          toast(`Interrupção ${values?.id ? 'guardada' : 'marcada'} com sucesso!`, successConfig);
          loadCalendar(calendarId);
        } else {
          toast(`Ocorreu um erro ao ${values?.id ? 'guardar' : 'marcar'} a interrupção!`, errorConfig);
        }
      });
    setOpenModal(false);
    setIsLoading(true);
  };

  useEffect(() => {
    if (typeof calendarPhase === 'number') {
      setCalendarPermissions(JSON.parse(localStorage.getItem('calendarPermissions'))?.filter((perm) => perm.phase_id === calendarPhase) || []);
    }
  }, [calendarPhase]);

  const onSubmitExam = (values) => {
    setSavingExam(true);
    const axiosFn = values?.id ? axios.patch : axios.post;
    axiosFn(`/exams/${values?.id ? values?.id : ''}`, {
      calendar_id: parseInt(calendarId, 10),
      course_id: generalInfo?.course?.id,
      room: values.room || undefined,
      date: moment(values.date).format('YYYY-MM-DD'),
      hour: values.hour,
      duration_minutes: values.durationMinutes || undefined,
      observations: values.observations,
      epoch_id: values.epoch,
      method_id: values.method,
      course_unit_id: values.courseUnit,
    })
      .then((res) => {
        setSavingExam(false);
        if (res.status === 200 || res.status === 201) {
          setOpenExamModal(false);
          toast(`Avaliação ${values?.id ? 'guardada' : 'marcada'} com sucesso!`, successConfig);
          loadCalendar(calendarId);
        } else {
          toast(`Ocorreu um erro ao ${values?.id ? 'guardar' : 'marcar'} a avaliação!`, errorConfig);
        }
      });
  };

  const removeInterruption = (interruptionId) => {
    SweetAlertComponent.fire({
      title: 'Atenção!',

      html: 'Ao eliminar a interrupção, todo o período compreendido entre o ínicio e o fim desta interrupção, ficará aberto para avaliações!<br/><strong>Tem a certeza que deseja eliminar esta interrupção, em vez de editar?</strong>',
      denyButtonText: 'Não',
      confirmButtonText: 'Sim',
      showConfirmButton: true,
      showDenyButton: true,
      confirmButtonColor: '#21ba45',
      denyButtonColor: '#db2828',
    })
      .then((result) => {
        if (result.isConfirmed) {
          setRemovingExam(interruptionId);
          axios.delete(`/interruptions/${interruptionId}`).then((res) => {
            setRemovingExam(null);
            loadCalendar(calendarId);
            if (res.status === 200) {
              toast('Interrupção eliminada com sucesso deste calendário!', successConfig);
            } else {
              toast('Ocorreu um problema ao eliminar a interrupção deste calendário!', errorConfig);
            }
          });
        }
      });
  };

  useEffect(() => {
    if (!openExamModal) {
      setExamInfoModal(undefined);
      setNoMethods(false);
      setSelectedEpoch(undefined);
      setCourseUnits([]);
      setMethodList([]);
    }
  }, [openExamModal]);

  const removeExam = (examId) => {
    SweetAlertComponent.fire({
      title: 'Atenção!',

      html: 'Ao eliminar este exame, terá de adicioná-lo novamente em outra data a escolher!<br/><br/><strong>Tem a certeza que deseja eliminar este exame, em vez de editar?</strong>',
      denyButtonText: 'Não',
      confirmButtonText: 'Sim',
      showConfirmButton: true,
      showDenyButton: true,
      confirmButtonColor: '#21ba45',
      denyButtonColor: '#db2828',
    })
      .then((result) => {
        if (result.isConfirmed) {
          setRemovingExam(examId);
          axios.delete(`/exams/${examId}`).then((res) => {
            setRemovingExam(null);
            loadCalendar(calendarId);
            if (res.status === 200) {
              toast('Exame eliminado com sucesso deste calendário!', successConfig);
            } else {
              toast('Ocorreu um problema ao eliminar o exame deste calendário!', errorConfig);
            }
          });
        }
      });
  };

  const handleFaqClick = (e, titleProps) => {
    const { index } = titleProps;
    const newIndex = activeIndex === index ? -1 : index;
    setActiveIndex(newIndex);
  };

  const weekData = useMemo(
    () => _.orderBy(
      epochsList.reduce((acc, curr) => {
        const start_date = moment(curr.start_date);
        const end_date = moment(curr.end_date);
        while (start_date <= end_date) {
          if (start_date.day() !== 0) {
            if (
              !acc.filter(
                ({ week }) => week === start_date.isoWeek(),
              ).length
            ) {
              acc.push({
                week: start_date.isoWeek(),
                year: start_date.year(),
                days: [],
              });
            }

            const currentInterruption = interruptionsList.find(
              (interruption) => {
                const interruptionStartDate = moment(
                  interruption.start_date,
                  'YYYY-MM-DD',
                );
                const interruptionEndDate = moment(
                  interruption.end_date,
                  'YYYY-MM-DD',
                );

                return (
                  (start_date.isAfter(
                    interruptionStartDate,
                  )
                                            && start_date.isBefore(
                                              interruptionEndDate,
                                            ))
                                        || start_date.isSame(
                                          interruptionStartDate,
                                          'day',
                                        )
                                        || start_date.isSame(
                                          interruptionEndDate,
                                          'day',
                                        )
                );
              },
            );

            const week = acc.find(
              ({ week }) => week === start_date.isoWeek(),
            );
            if (
              !week.days.find(
                (day) => day.weekDay === start_date.day(),
              )
            ) {
              week.days.push({
                weekDay: start_date.day(),
                date: start_date.format(),
                interruption: currentInterruption,
                interruptionDays: 1,
              });
            }

            const foundMultipleDaysWithSameInterruption = acc
              .find(
                ({ week }) => week === start_date.isoWeek(),
              )
              .days.filter(
                (x) => x.interruption?.id
                                        === currentInterruption?.id,
              );

            if (foundMultipleDaysWithSameInterruption?.length) {
              foundMultipleDaysWithSameInterruption[0].interruptionDays = foundMultipleDaysWithSameInterruption.length;
            }
          }

          start_date.add(1, 'days');
        }

        return acc;
      }, []),
      ['year', 'week'],
    ),
    [epochsList, interruptionsList],
  );

  useEffect(() => {
    if (loadRemainingCourseUnits) {
      axios
        .get(
          `/available-methods/${calendarId}/?epoch_id=${selectedEpoch}&year=${examInfoModal.year}`,
        )
        .then((response) => {
          if (response.status === 200) {
            const branches = examInfoModal
              .existingExamsAtThisDate?.filter((x) => x.academic_year === examInfoModal.year)
              ?.map((y) => y?.course_unit?.branch?.id);
            const beforeSetCourseUnits = response.data.data?.filter(
              (x) => !(branches.length ? branches?.includes(x?.branch?.id) : false),
            );

            const mapped = beforeSetCourseUnits?.map(
              ({
                id, name, methods, branch,
              }) => ({
                key: id,
                value: id,
                text: name,
                methods,
                branch,
              }),
            );

            setCourseUnits(mapped);
            setNoMethods(response.data.data?.length === 0 || beforeSetCourseUnits?.length === 0);
          }
        });
      setLoadRemainingCourseUnits(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadRemainingCourseUnits, examInfoModal]);

  useEffect(() => {
    if (loadInterruptionTypes) {
      if (!interruptionTypes?.length) {
        axios.get('/interruption-types').then((response) => {
          if (response.status === 200) {
            setInterruptionTypesList(
              response.data.data?.map(({ id, description }) => ({
                key: id,
                value: id,
                text: description,
              })),
            );
          }
        });
      }
      setLoadInterruptionTypes(false);
    }
  }, [loadInterruptionTypes, interruptionTypes]);

  useEffect(() => {
    loadCalendar(calendarId);
  }, [calendarId, history]);

  useEffect(() => {
    axios.get('/calendar-phases').then((response) => {
      if (response.status === 200) {
        setCalendarPhases(
          response.data.data?.map(({ id, description, name }) => ({
            key: id,
            value: id,
            text: description,
            name,
          })),
        );
      }
    });
  }, []);

  const publishCalendar = () => {
    setPublishLoading(true);
    axios.post(`/calendar/${calendarId}/publish`).then((res) => {
      setPublishLoading(false);
      loadCalendar(calendarId);
      if (res.status === 200) {
        toast('Calendário publicado com sucesso!', successConfig);
      } else {
        toast('Ocorreu um erro ao tentar publicar o calendário!', errorConfig);
      }
    });
  };

  const onEditInterruptionClick = (interruption) => {
    setLoadInterruptionTypes(
      true,
    );
    setModalInfo({
      ...interruption,
    });
    setOpenModal(
      true,
    );
  };

  const createCopy = () => {
    SweetAlertComponent.fire({
      title: 'Atenção!',

      html: 'Ao criar uma cópia deste calendário, irá eliminar todas as cópias criadas anteriormente deste mesmo calendário!<br/><br/><strong>Tem a certeza que deseja criar uma cópia do calendário?</strong>',
      denyButtonText: 'Não',
      confirmButtonText: 'Sim',
      showConfirmButton: true,
      showDenyButton: true,
      confirmButtonColor: '#21ba45',
      denyButtonColor: '#db2828',
    })
      .then((result) => {
        if (result.isConfirmed) {
          setCreatingCopy(true);
          axios.post(`/calendar/${calendarId}/publish`, {
            createCopy: true,
          }).then((res) => {
            setCreatingCopy(false);
            if (res.status === 200) {
              toast('Cópia do calendário criada com sucesso!', successConfig);
            } else {
              toast('Ocorreu um erro ao tentar criar uma cópia do calendário!', errorConfig);
            }
          });
        }
      });
  };

  function range(start, end) {
    return Array(end - start + 1)
      .fill()
      .map((_, idx) => start + idx);
  }

  const courseYears = generalInfo?.course?.duration
    ? range(1, generalInfo?.course?.duration)
    : [];
  const weekDays = [1, 2, 3, 4, 5, 6];
  let alreadyAddedColSpan = false;
  let alreadyAddedRowSpan = false;
  let interruptionDays = 0;

  return (
    <Container>
      <AnimatePresence>
        {isLoading && (
        <PageLoader
          animate={{
            opacity: 1,
            transition: {
              duration: 0.5,
              ease: [0.4, 0.0, 0.2, 1],
            },
          }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.5,
              ease: [0.4, 0.0, 0.2, 1],
            },
          }}
        />
        )}
      </AnimatePresence>
      <br />
      <Header as="h3">Calendário de Avaliação</Header>
      <Header as="h4">
        Curso:
        {' '}
        {generalInfo?.course?.name}
      </Header>
      <Header as="h5">Legenda:</Header>
      <div style={{ display: 'flex' }}>
        <Popup
          content="Toda a avaliação que possua esta legenda, foi modificada em relação à versão anterior do calendário."
          trigger={(
            <LegendBox backgroundColor="rgb(237, 170, 0)">
              Modificado
            </LegendBox>
                      )}
        />
        <LegendBox backgroundColor="#ddd9c1">Avaliação</LegendBox>
      </div>
      <Grid stackable>
        <Grid.Row>
          <Grid.Column width="12">
            {weekData.map(({ week, year, days }) => {
              interruptionDays = 0;
              alreadyAddedColSpan = false;
              return (
                <Table celled style={{ userSelect: 'none' }}>
                  <Table.Header>
                    <Table.Row textAlign="center">
                      <Table.HeaderCell width="2">
                        {week}
                      </Table.HeaderCell>
                      <Table.HeaderCell width="2">
                        2ª Feira
                      </Table.HeaderCell>
                      <Table.HeaderCell width="2">
                        3ª Feira
                      </Table.HeaderCell>
                      <Table.HeaderCell width="2">
                        4ª Feira
                      </Table.HeaderCell>
                      <Table.HeaderCell width="2">
                        5ª Feira
                      </Table.HeaderCell>
                      <Table.HeaderCell width="2">
                        6ª Feira
                      </Table.HeaderCell>
                      <Table.HeaderCell width="2">
                        Sábado
                      </Table.HeaderCell>
                    </Table.Row>
                    <Table.Row>
                      <Table.HeaderCell textAlign="center">
                        {year}
                      </Table.HeaderCell>
                      {weekDays.map((weekDay) => {
                        const day = days.find(
                          (day) => day.weekDay === weekDay,
                        );
                        const firstDayAvailable = moment(days[0].date);
                        const lastDayAvailable = moment(
                          days[days.length - 1].date,
                        );
                        if (!day?.date) {
                          if (
                            weekDay === 1
                                                        || (lastDayAvailable.day()
                                                            < 6
                                                            && !alreadyAddedColSpan)
                          ) {
                            alreadyAddedColSpan = true;
                            return (
                              <Table.HeaderCell
                                colSpan={
                                    lastDayAvailable.day()
                                    < 6
                                      ? 6
                                          - lastDayAvailable.day()
                                      : firstDayAvailable.day()
                                          - 1
                                }
                              />
                            );
                          } if (
                            !alreadyAddedColSpan
                          ) {
                            return (
                              <Table.HeaderCell />
                            );
                          }
                        } else if (day?.date) {
                          return (
                            <Table.HeaderCell textAlign="center">
                              {moment(
                                day.date,
                              ).format(
                                'DD-MM-YYYY',
                              )}
                            </Table.HeaderCell>
                          );
                        }
                        return null;
                      })}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {courseYears.map(
                      (year, courseIndex) => {
                        alreadyAddedColSpan = false;
                        return (
                          <Table.Row>
                            <Table.Cell textAlign="center">
                              {year}
                              º Ano
                            </Table.Cell>
                            {weekDays.map(
                              (weekDay) => {
                                const day = days.find(
                                  (day) => day.weekDay === weekDay,
                                );
                                const firstDayAvailable = moment(
                                  days[0]
                                    .date,
                                );
                                const lastDayAvailable = moment(
                                  days[
                                    days.length - 1
                                  ].date,
                                );
                                const {
                                  interruption,
                                } = day || {};
                                const isInterruption = !!interruption;
                                if (
                                  isInterruption
                                    && courseIndex
                                        === 0
                                    && interruption.id
                                        !== days.find(
                                          (
                                            day,
                                          ) => day.weekDay
                                                === weekDay
                                                    - 1,
                                        )
                                          ?.interruption
                                          ?.id
                                ) {
                                  interruptionDays = 0;
                                  alreadyAddedRowSpan = false;
                                }

                                if (
                                  (isInterruption
                                    && alreadyAddedRowSpan
                                    && courseIndex
                                        > 0)
                                || (isInterruption
                                    && interruptionDays++
                                        >= day?.interruptionDays)
                                ) {
                                  return null;
                                }
                                if (
                                  (year
                                    === 1
                                    && !day?.date)
                                || isInterruption
                                ) {
                                  if (
                                    !isInterruption
                                      && (weekDay
                                          === 1
                                          || (lastDayAvailable.day()
                                              < 6
                                              && !alreadyAddedColSpan))
                                  ) {
                                    alreadyAddedColSpan = true;
                                    return (
                                      <Table.Cell
                                        colSpan={
                                            isInterruption
                                            && lastDayAvailable.day()
                                                < 6
                                              ? 6
                                                  - lastDayAvailable.day()
                                              : firstDayAvailable.day()
                                                  - 1
                                        }
                                        rowSpan={
                                            courseYears.length
                                        }
                                      />
                                    );
                                  } if (
                                    !alreadyAddedColSpan
                                      || (isInterruption
                                          && courseIndex
                                              === 0)
                                  ) {
                                    alreadyAddedRowSpan = true;

                                    return (
                                      <Table.Cell
                                        textAlign="center"
                                        style={
                                          isInterruption
                                            ? {
                                              backgroundColor:
                                                        '#c9c9c9',
                                              fontWeight:
                                                        'bold',
                                            }
                                            : null
                                        }
                                        rowSpan={courseYears.length}
                                        colSpan={
                                          isInterruption
                                            ? day?.interruptionDays
                                            : null
                                        }
                                      >
                                        <div>
                                          {isInterruption
                                            ? interruption.description
                                            : null}
                                        </div>
                                      </Table.Cell>
                                    );
                                  }
                                } else if (
                                  day?.date
                                ) {
                                  const existingExamsAtThisDate = examList.filter(
                                    (
                                      exam,
                                    ) => moment(
                                      exam.date,
                                    ).isSame(
                                      moment(
                                        day.date,
                                      ),
                                      'day',
                                    ),
                                  );
                                  let examsComponents = null;
                                  if (
                                    existingExamsAtThisDate?.length
                                  ) {
                                    examsComponents = existingExamsAtThisDate.map(
                                      (
                                        exam,
                                      ) => {
                                        if (
                                          exam.academic_year === year
                                        ) {
                                          return (
                                            <CellButton
                                              key={exam.id}
                                              color="black"
                                              backgroundColor="#ddd9c1"
                                              height="auto"
                                              fontSize="11px"
                                              margin="0 0 10px 0"
                                              onClick={() => {
                                                setExamInfoModal(
                                                  {
                                                    ...exam,
                                                    year,
                                                  },
                                                );
                                                setViewExamInformation(
                                                  true,
                                                );
                                              }}
                                              isModified={differences?.includes(
                                                exam.id,
                                              )}
                                            >
                                              {removingExam === exam.id ? <Icon loading name="spinner" />
                                                : !isPublished
                                                && calendarPermissions.filter(
                                                  (x) => x.name === SCOPES.REMOVE_EXAMS
                                                    || x.name === SCOPES.EDIT_EXAMS,
                                                ).length > 0
                                              && (
                                                <div style={{ position: 'relative', height: '20px' }}>
                                                  {calendarPermissions.filter(
                                                    (x) => x.name === SCOPES.EDIT_EXAMS,
                                                  ).length > 0 && (
                                                    <EditExamButton onClick={() => {
                                                      setExamInfoModal(
                                                        {
                                                          ...exam,
                                                          year,
                                                        },
                                                      );
                                                      setOpenExamModal(
                                                        true,
                                                      );
                                                    }}
                                                    >
                                                      <Icon name="edit" />
                                                    </EditExamButton>
                                                  )}
                                                  {calendarPermissions.filter(
                                                    (x) => x.name === SCOPES.EDIT_EXAMS,
                                                  ).length > 0 && (
                                                    <RemoveExamButton
                                                      onClick={() => removeExam(exam.id)}
                                                    >
                                                      <Icon name="trash" />
                                                    </RemoveExamButton>
                                                  )}
                                                </div>
                                              )}
                                              {
                                                  exam.hour
                                              }
                                              {' '}
                                              {
                                                  exam
                                                    .course_unit
                                                    .initials
                                              }
                                              {' '}
                                              {
                                                  exam
                                                    .method
                                                    .name
                                              }
                                            </CellButton>
                                          );
                                        }
                                        return null;
                                      },
                                    );
                                  }
                                  return (
                                    <>
                                      <Table.Cell
                                        textAlign="center"
                                        onContextMenu={(
                                          e,
                                        ) => {
                                          e.preventDefault();
                                          if (!isPublished
                                            && existingExamsAtThisDate?.length === 0
                                            && calendarPermissions
                                              .filter((x) => x.name === SCOPES.ADD_INTERRUPTION)
                                              .length > 0) {
                                            setModalInfo(
                                              {
                                                start_date: day.date,
                                              },
                                            );
                                            setOpenModal(
                                              true,
                                            );
                                            setLoadInterruptionTypes(
                                              true,
                                            );
                                          }
                                        }}
                                      >
                                        {
                                            examsComponents
                                        }
                                        {!isPublished
                                          && calendarPermissions
                                            .filter((x) => x.name === SCOPES.ADD_EXAMS)
                                            .length > 0 && (
                                            <CellButton
                                              onClick={() => {
                                                setExamInfoModal(
                                                  {
                                                    date: day.date,
                                                    year,
                                                    existingExamsAtThisDate,
                                                  },
                                                );
                                                setOpenExamModal(
                                                  true,
                                                );
                                              }}
                                            >
                                              Marcar
                                            </CellButton>
                                        )}
                                      </Table.Cell>
                                    </>
                                  );
                                }
                                return null;
                              },
                            )}
                          </Table.Row>
                        );
                      },
                    )}
                  </Table.Body>
                </Table>
              );
            })}
          </Grid.Column>
          {/* <ShowComponentIfAuthorized permission={[SCOPES]}> */}
          <Grid.Column width="4">
            <Segment>
              <Card>
                <Card.Content>
                  <Card.Header>
                    Informações
                  </Card.Header>
                </Card.Content>
                <ShowComponentIfAuthorized permission={[SCOPES.VIEW_CALENDAR_INFO]}>
                  <Card.Content>
                    {!isPublished ? (
                      <ShowComponentIfAuthorized permission={[SCOPES.PUBLISH_CALENDAR]}>
                        <p>
                          <span>
                            <Header as="h5">Publicar</Header>
                            <Button color="teal" loading={publishLoading} onClick={publishCalendar}>Publicar esta versão</Button>
                          </span>
                        </p>
                      </ShowComponentIfAuthorized>
                    ) : (
                      <ShowComponentIfAuthorized permission={[SCOPES.CREATE_COPY]}>
                        <p>
                          <span>
                            <Header as="h5">Criar cópia editável</Header>
                            <Button color="teal" loading={creatingCopy} onClick={createCopy}>Criar um cópia desta versão</Button>
                          </span>
                        </p>
                      </ShowComponentIfAuthorized>
                    )}
                    {
                      !isPublished && calendarPermissions.filter((x) => x.name === SCOPES.CHANGE_CALENDAR_PHASE).length > 0 ? (
                        <p>
                          <span>
                            <Header as="h5">Fase:</Header>
                            <Dropdown
                              options={calendarPhases.filter((x) => x.name !== 'system' && x.name !== 'published')}
                              selection
                              search
                              label="Fase do Calendário"
                              loading={!calendarPhases.length || updatingCalendarPhase}
                              onChange={(
                                e,
                                { value },
                              ) => {
                                updateCalendarPhase(value);
                              }}
                              value={calendarPhase}
                            />
                          </span>
                        </p>
                      ) : (
                        <ShowComponentIfAuthorized
                          permission={[SCOPES.VIEW_ACTUAL_PHASE]}
                        >
                          <Header as="h5">Fase:</Header>
                          <span>
                            {
                              calendarPhases.find((x) => x.key === calendarPhase)?.text
                                    || generalInfo
                                      ?.phase
                                      ?.description
                                  }
                          </span>
                        </ShowComponentIfAuthorized>
                      )
                    }

                    <p>
                      <span>
                        <Header as="h5">Estado:</Header>
                        <Button.Group>
                          <Button
                            compact
                            onClick={() => updateCalendarStatus(
                              true,
                            )}
                            positive={isTemporary}
                            disabled={isPublished || previousFromDefinitive}
                          >
                            Temporário
                          </Button>
                          <Button
                            compact
                            onClick={() => updateCalendarStatus(
                              false,
                            )}
                            positive={!isTemporary}
                            disabled={isPublished || previousFromDefinitive}
                          >
                            Definitivo
                          </Button>
                        </Button.Group>
                      </span>
                    </p>
                    <p>
                      <span>
                        <Header as="h5">Ano Letivo:</Header>
                        2019-20
                      </span>
                    </p>
                    <p>
                      <span>
                        <Header as="h5">Curso: </Header>
                        {generalInfo?.course?.name}
                      </span>
                    </p>
                    <p>
                      <span>
                        <Header as="h5">
                          Última alteração:
                        </Header>
                        {moment(
                          generalInfo?.calendar_last_update,
                        ).format('DD MMMM, YYYY HH:mm')}
                      </span>
                    </p>
                  </Card.Content>
                </ShowComponentIfAuthorized>
                <Card.Content>
                  <Header as="h4">Épocas</Header>
                  <List divided relaxed>
                    {epochsList.map((epoch) => (
                      <List.Item>
                        <List.Icon
                          name="calendar alternate"
                          size="large"
                          verticalAlign="middle"
                        />
                        <List.Content>
                          <List.Header>
                            {epoch.name}
                          </List.Header>
                          <List.Description>
                            <b>Ínicio:</b>
                            {' '}
                            {moment(
                              epoch.start_date,
                            ).format(
                              'DD MMMM, YYYY',
                            )}
                          </List.Description>
                          <List.Description>
                            <b>Fim:</b>
                            {' '}
                            {moment(
                              epoch.end_date,
                            ).format(
                              'DD MMMM, YYYY',
                            )}
                          </List.Description>
                        </List.Content>
                      </List.Item>
                    ))}
                  </List>
                </Card.Content>
                <Card.Content>
                  <Header as="h4">
                    Interrupções letivas
                  </Header>
                  <List divided relaxed>
                    {interruptionsList
                      .filter(
                        (x) => !x.isHoliday && x.start_date
                        > _.min(
                          epochsList.map(
                            (x) => x.start_date,
                          ),
                        )
                    && x.end_date
                        < _.max(
                          epochsList.map(
                            (x) => x.end_date,
                          ),
                        ),
                      )
                      .map((interruption) => (
                        <List.Item>
                          <List.Icon
                            name="calendar alternate"
                            size="large"
                            verticalAlign="middle"
                          />
                          <List.Content>
                            <List.Header>
                              {
                                                                interruption.description
                                                            }
                            </List.Header>
                            {moment(
                              interruption.start_date,
                            ).isSame(
                              moment(
                                interruption.end_date,
                              ),
                            ) ? (
                              <>
                                {' '}
                                <List.Description>
                                  <b>Dia:</b>
                                  {' '}
                                  {moment(
                                    interruption.start_date,
                                  ).format(
                                    'DD MMMM, YYYY',
                                  )}
                                </List.Description>
                                {!isPublished
                                                && calendarPermissions.filter(
                                                  (x) => x.name === SCOPES.EDIT_INTERRUPTION,
                                                ).length > 0
                                && (
                                <Button
                                  icon
                                  color="yellow"
                                  onClick={() => onEditInterruptionClick(interruption)}
                                >
                                  <Icon name="edit" />
                                </Button>
                                )}
                                {
                                  !isPublished
                                  && calendarPermissions.filter(
                                    (x) => x.name === SCOPES.REMOVE_INTERRUPTION,
                                  ).length > 0
                                  && (
                                  <Button icon color="red" onClick={() => removeInterruption(interruption.id)}>
                                    <Icon name="trash" />
                                  </Button>
                                  )
                                }

                              </>
                              ) : (
                                <>
                                  <List.Description>
                                    <b>
                                      Ínicio:
                                    </b>
                                    {' '}
                                    {moment(
                                      interruption.start_date,
                                    ).format(
                                      'DD MMMM, YYYY',
                                    )}
                                  </List.Description>
                                  <List.Description>
                                    <b>Fim:</b>
                                    {' '}
                                    {moment(
                                      interruption.end_date,
                                    ).format(
                                      'DD MMMM, YYYY',
                                    )}
                                  </List.Description>

                                  {!isPublished
                                                && calendarPermissions.filter(
                                                  (x) => x.name === SCOPES.EDIT_INTERRUPTION,
                                                ).length > 0
                                && (
                                <Button
                                  icon
                                  color="yellow"
                                  onClick={() => onEditInterruptionClick(interruption)}
                                >
                                  <Icon name="edit" />
                                </Button>
                                )}
                                  {
                                  !isPublished
                                  && calendarPermissions.filter(
                                    (x) => x.name === SCOPES.REMOVE_INTERRUPTION,
                                  ).length > 0
                                  && (
                                  <Button icon color="red" onClick={() => removeInterruption(interruption.id)}>
                                    <Icon name="trash" />
                                  </Button>
                                  )
                                }
                                </>
                              )}
                          </List.Content>
                        </List.Item>
                      ))}
                  </List>
                </Card.Content>
              </Card>
              <ShowComponentIfAuthorized permission={[SCOPES.ADD_EXAMS]}>
                <Segment inverted>
                  <Header as="h3">Ajuda</Header>
                  <Accordion inverted>
                    <Accordion.Title
                      active={activeIndex === 0}
                      index={0}
                      onClick={handleFaqClick}
                    >
                      <Icon name="dropdown" />
                      Como marcar uma avaliação?
                    </Accordion.Title>
                    <Accordion.Content
                      active={activeIndex === 0}
                    >
                      <p>
                        Para marcar uma avaliação, deve
                        procurar no calendário o dia
                        apropriado e carregar na opção
                        "Marcar" que aparecerá na célula
                        correspondente. De seguida, deverá
                        preencher todas as informações
                        necessárias.
                      </p>
                    </Accordion.Content>
                    <Accordion.Title
                      active={activeIndex === 1}
                      index={1}
                      onClick={handleFaqClick}
                    >
                      <Icon name="dropdown" />
                      Como marcar uma nova interrupção?
                    </Accordion.Title>
                    <Accordion.Content
                      active={activeIndex === 1}
                    >
                      <p>
                        Para marcar uma nova interrupção,
                        deve procurar no calendário o dia de
                        ínicio da interrupção, e utilizar o
                        clique direito do rato sobre essa
                        célula. De seguida, deverá preencher
                        todas as informações necessárias.
                      </p>
                    </Accordion.Content>
                  </Accordion>
                </Segment>
              </ShowComponentIfAuthorized>
            </Segment>
          </Grid.Column>
          {/* </ShowComponentIfAuthorized> */}
        </Grid.Row>
      </Grid>
      <FinalForm
        onSubmit={onSubmitInterruption}
        initialValues={{
          id: modalInfo?.id || null,
          startDate: moment(modalInfo?.start_date).format(
            'DD MMMM, YYYY',
          ),
          endDate: modalInfo?.id ? moment(modalInfo?.end_date).format(
            'DD MMMM, YYYY',
          ) : null,
          description: modalInfo?.id ? modalInfo?.description : null,
          interruptionType: modalInfo?.id ? modalInfo?.interruption_type_id : null,
        }}
        render={({ handleSubmit }) => (
          <Modal
            closeOnEscape
            closeOnDimmerClick
            open={openModal}
            onClose={() => setOpenModal(false)}
          >
            <Modal.Header>
              {modalInfo?.id ? 'Editar' : 'Adicionar'}
              {' '}
              interrupção
            </Modal.Header>
            <Modal.Content>
              <Form>
                <p>Detalhes da interrupção</p>
                <Field name="description">
                  {({ input: descriptionInput }) => (
                    <Form.Input
                      label="Descrição"
                      placeholder="Descrição (opcional)"
                      {...descriptionInput}
                    />
                  )}
                </Field>
                <Field name="interruptionType">
                  {({ input: interruptionTypeInput }) => (
                    <Form.Dropdown
                      options={interruptionTypes}
                      selection
                      search
                      loading={!interruptionTypes.length}
                      label="Tipo de interrupção"
                      value={interruptionTypeInput.value}
                      onChange={(e, { value }) => interruptionTypeInput.onChange(
                        value,
                      )}
                    />
                  )}
                </Field>
                <Field name="startDate">
                  {({ input: startDateInput }) => (
                    <Form.Field>
                      <DateInput
                        name="date"
                        iconPosition="left"
                        label="Data de Ínicio"
                        placeholder="Data de Ínicio"
                        dateFormat="DD MMMM, YYYY"
                        value={startDateInput.value}
                        onChange={(evt, { value }) => {
                          startDateInput.onChange(
                            value,
                          );
                        }}
                      />
                    </Form.Field>
                  )}
                </Field>
                <Field name="endDate">
                  {({ input: endDateInput }) => (
                    <Form.Field>
                      <DateInput
                        name="date"
                        iconPosition="left"
                        label="Data de Fim"
                        placeholder="Data de Fim"
                        dateFormat="DD MMMM, YYYY"
                        value={endDateInput.value}
                        onChange={(evt, { value }) => {
                          endDateInput.onChange(
                            value,
                          );
                        }}
                      />
                    </Form.Field>
                  )}
                </Field>
              </Form>
            </Modal.Content>
            <Modal.Actions>
              <Button
                onClick={() => setOpenModal(false)}
                negative
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                positive
                icon={!!modalInfo?.id}
                {...(modalInfo?.id && ({ labelPosition: 'left' }))}
              >

                {modalInfo?.id && <Icon name="save" />}
                {modalInfo?.id ? 'Gravar alterações' : 'Adicionar'}
              </Button>
            </Modal.Actions>
          </Modal>
        )}
      />

      <Modal
        closeOnEscape
        closeOnDimmerClick
        open={viewExamInformation}
        onClose={() => setViewExamInformation(false)}
      >
        <Modal.Header>
          Detalhes da avaliação
        </Modal.Header>
        <Modal.Content>
          <Grid divided="vertically">
            <Grid.Row columns="2">
              <Grid.Column>
                <p>
                  <b>Ano Curricular: </b>
                  {examInfoModal?.year}
                  º Ano
                </p>
                <p>
                  <b>Data: </b>
                  {moment(examInfoModal?.date).format(
                    'DD MMMM, YYYY',
                  )}
                </p>
                <p>
                  <b>Sala da avaliação: </b>
                  {examInfoModal?.room}
                </p>
                {examInfoModal?.duration_minutes && (
                <p>
                  <b>Duração: </b>
                  {examInfoModal?.duration_minutes}
                  {' '}
                  minutos
                </p>
                )}

                <p>
                  <b>Hora de ínicio: </b>
                  {examInfoModal?.hour}
                </p>
                <p>
                  <b>Observações: </b>
                  {examInfoModal?.observations}
                </p>
              </Grid.Column>
              <Grid.Column>
                <ShowComponentIfAuthorized permission={[SCOPES.VIEW_COMMENTS, SCOPES.ADD_COMMENTS]}>
                  <ShowComponentIfAuthorized permission={[SCOPES.VIEW_COMMENTS]}>
                    <Button icon color={!showIgnoredComments ? 'green' : 'red'} labelPosition="left" onClick={() => setShowIgnoredComments((cur) => !cur)}>
                      <Icon name={`eye ${showIgnoredComments ? 'slash' : ''}`} />
                      {!showIgnoredComments ? 'Mostrar' : 'Esconder'}
                      {' '}
                      ignorados
                    </Button>
                  </ShowComponentIfAuthorized>

                  <Comment.Group>
                    <ShowComponentIfAuthorized permission={[SCOPES.VIEW_COMMENTS]}>

                      <Header as="h3" dividing>
                        Comentários
                      </Header>

                      {examInfoModal?.comments?.filter((x) => (showIgnoredComments ? true : !x.ignored))?.map((comment) => (
                        <Comment>
                          <Comment.Avatar src={`https://avatars.dicebear.com/api/human/${comment.user.id}.svg?w=50&h=50&mood[]=sad&mood[]=happy`} />
                          <Comment.Content
                            style={comment.ignored ? { backgroundColor: 'lightgrey' } : {}}
                          >
                            <Comment.Author as="a">{comment.user.name}</Comment.Author>
                            <Comment.Metadata>
                              <div>{comment.date}</div>
                            </Comment.Metadata>
                            <Comment.Text>
                              {comment.comment}
                              {comment.ignored ? (
                                <div style={{
                                  position: 'absolute', top: '5px', right: '5px', userSelect: 'none',
                                }}
                                >
                                  Comentário ignorado
                                </div>
                              ) : ''}
                            </Comment.Text>
                            <Comment.Actions>
                              { !comment.ignored && (
                              <Comment.Action
                                onClick={() => ignoreComment(comment.id)}
                              >
                                Ignorar
                              </Comment.Action>
                              )}
                            </Comment.Actions>
                          </Comment.Content>
                        </Comment>
                      ))}
                    </ShowComponentIfAuthorized>
                    {!isPublished && (
                    <ShowComponentIfAuthorized permission={[SCOPES.ADD_COMMENTS]}>
                      <Form reply>
                        <Form.TextArea onChange={(ev, { value }) => setCommentText(value)} />
                        <Button onClick={() => addComment(examInfoModal?.id)} content="Adicionar comentário" labelPosition="left" icon="edit" primary />
                      </Form>
                    </ShowComponentIfAuthorized>
                    )}

                  </Comment.Group>

                </ShowComponentIfAuthorized>

              </Grid.Column>
            </Grid.Row>
          </Grid>

        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={() => setViewExamInformation(false)}
            negative
          >
            Fechar
          </Button>
        </Modal.Actions>
      </Modal>

      <FinalForm
        onSubmit={onSubmitExam}
        initialValues={{
          id: examInfoModal?.id || undefined,
          date: moment(examInfoModal?.date).format('DD MMMM, YYYY'),
          room: examInfoModal?.id ? examInfoModal?.room : null,
          durationMinutes: examInfoModal?.id ? examInfoModal?.duration_minutes : null,
          hour: examInfoModal?.id ? examInfoModal?.hour : null,
          observations: examInfoModal?.id ? examInfoModal?.observations : null,
        }}
        render={({ handleSubmit }) => (
          <Modal
            closeOnEscape
            closeOnDimmerClick
            open={openExamModal}
            onClose={() => {
              setOpenExamModal(false);
            }}
          >
            <Modal.Header>
              {examInfoModal?.id ? 'Editar' : 'Marcar'}
              {' '}
              avaliação
            </Modal.Header>
            <Modal.Content>
              <Form>
                <Header as="h4">Detalhes da avaliação</Header>
                <p>
                  <b>Ano Curricular: </b>
                  {examInfoModal?.year}
                  º Ano
                </p>
                <p>
                  <b>Data: </b>
                  {changeData ? (
                    <DateInput
                      value={moment(examInfoModal?.date).format(
                        'DD MMMM, YYYY',
                      )}
                      onChange={(evt,
                        { value }) => {
                        setExamInfoModal((current) => ({
                          ...current,
                          date: moment(value, 'DD-MM-YYYY'),
                        }));
                        setChangeData(false);
                      }}
                    />
                  ) : moment(examInfoModal?.date).format(
                    'DD MMMM, YYYY',
                  )}
                </p>
                <p>
                  <Button color="yellow" icon labelPosition="left" onClick={() => setChangeData(true)}>
                    <Icon name="calendar alternate" />
                    Alterar data
                  </Button>
                </p>
                <Divider />
                {!examInfoModal?.id
                && (
                <>
                  <Field name="epoch">
                    {({ input: epochInput }) => (
                      <Form.Dropdown
                        options={epochsList
                          .filter((epoch) => moment(
                            examInfoModal?.date,
                          ).isBetween(
                            moment(
                              epoch.start_date,
                            ),
                            moment(epoch.end_date), undefined,
                            '[]',
                          ))
                          ?.map((epoch) => ({
                            key: epoch.id,
                            value: epoch.id,
                            text: epoch.name,
                          }))}
                        selection
                        search
                        label="Época"
                        onChange={(e, { value }) => {
                          setCourseUnits([]);
                          setSelectedEpoch(value);
                          setLoadRemainingCourseUnits(
                            true,
                          );
                          epochInput.onChange(value);
                        }}
                      />
                    )}
                  </Field>
                  { noMethods
                    && (
                    <Message negative>
                      <Message.Header>Não foram encontradas unidades curriculares</Message.Header>
                      <p>Não foram encontradas unidades curriculares com métodos de avaliação atríbuidos para esta época de avaliação.</p>
                    </Message>
                    )}
                  <Field name="courseUnit">
                    {({ input: courseUnitInput }) => (
                      <Form.Dropdown
                        options={courseUnits}
                        selection
                        search
                        disabled={!courseUnits?.length}
                        loading={
                            courseUnits !== undefined
                              ? !courseUnits.length
                              : false
                        }
                        label="Unidade Curricular"
                        onChange={(
                          e,
                          { value, options },
                        ) => {
                          setMethodList(
                            options
                              .find(
                                (courseUnit) => courseUnit.value === value,
                              )
                              .methods.map(
                                ({
                                  id, name, minimum, weight,
                                }) => ({
                                  key: id,
                                  value: id,
                                  text: `${name} / Min. ${minimum} / Peso: ${parseInt(weight, 10)}%`,
                                }),
                              ),
                          );
                          courseUnitInput.onChange(value);
                        }}
                      />
                    )}
                  </Field>
                  <Field name="method">
                    {({ input: methodInput }) => (
                      <Form.Dropdown
                        options={methodList}
                        selection
                        search
                        disabled={!methodList?.length}
                        loading={
                                                methodList !== undefined
                                                  ? !methodList.length
                                                  : false
                                            }
                        label="Método de Avaliação"
                        onChange={(e, { value }) => methodInput.onChange(value)}
                      />
                    )}
                  </Field>
                </>
                )}
                <Field name="room" defaultValue={examInfoModal?.id ? examInfoModal?.room : null}>
                  {({ input: roomInput }) => (
                    <Form.Input
                      label="Sala"
                      placeholder="Sala da avaliação (opcional)"
                      {...roomInput}
                      initialValue={examInfoModal?.room}
                    />
                  )}
                </Field>
                <Field name="durationMinutes">
                  {({ input: durationMinutesInput }) => (
                    <Form.Input
                      label="Duração"
                      placeholder="Duração em minutos (opcional)"
                      type="number"
                      step="1"
                      {...durationMinutesInput}
                    />
                  )}
                </Field>
                <Field name="hour">
                  {({ input: hourInput }) => (
                    <Form.Field>
                      <TimeInput
                        name="hour"
                        iconPosition="left"
                        label="Hora de ínicio"
                        placeholder="Hora de ínicio"
                        timeFormat="24"
                        value={hourInput.value}
                        onChange={(evt, { value }) => {
                          hourInput.onChange(value);
                        }}
                      />
                    </Form.Field>
                  )}
                </Field>
                <Field name="observations">
                  {({ input: observationsInput }) => (
                    <Form.Input
                      control={TextArea}
                      label="Observações"
                      placeholder="Observações (opcional)"
                      {...observationsInput}
                    />
                  )}
                </Field>
              </Form>
            </Modal.Content>
            <Modal.Actions>
              <Button
                onClick={() => setOpenExamModal(false)}
                negative
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                positive
                loading={savingExam}
              >
                {!examInfoModal?.id ? 'Marcar Avaliação' : 'Gravar alterações' }
              </Button>
            </Modal.Actions>
          </Modal>
        )}
      />
    </Container>
  );
};

export default Calendar;
