import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Button } from 'react-bootstrap';
import * as formik from 'formik';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import * as leoProfanity from 'leo-profanity';

import { handleEmit } from '../../socket';
import { closeModal, showToast } from '../../store/modal.slice';

const ModalRenameChannel = () => {
  const { t } = useTranslation();
  const { Formik } = formik;
  const dispatch = useDispatch();
  const focus = useRef();
  const { open, meta, extra } = useSelector((state) => state.modal);
  const { entities } = useSelector((state) => state.channels);
  const names = entities.map((entity) => entity.name);

  const schema = yup.object().shape({
    name: yup
      .string()
      .required(t('form.errors.enterChannelName'))
      .notOneOf(names, t('form.errors.alreadyCreated'))
      .min(2, t('form.errors.min'))
      .max(50, t('form.errors.validation.max'))
      .matches(/([^*])\1{3,}/, t('form.errors.filter'))
      .trim(),
  });

  // const onSubmit = (value) => {
  //   socket.emit('renameChannel', { id: meta, name: value.name });
  //   dispatch(closeModal());
  //   dispatch(showToast(t('toast.renamed')));
  // };

  const onSubmit = async (value) => {
    handleEmit('renameChannel', { id: meta, name: value.name }, () => dispatch(showToast()), () => { dispatch(showToast(t('toast.removed'))); });
    dispatch(closeModal());
  };

  useEffect(() => focus.current && focus.current.focus());

  return (
    <Modal show={open} onHide={() => dispatch(closeModal())} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {t('modal.renameChannel')}
          &lsquo;
          {extra}
          &lsquo;
        </Modal.Title>
      </Modal.Header>
      <Formik
        validationSchema={schema}
        onSubmit={onSubmit}
        initialValues={{
          name: '',
        }}
      >
        {({
          errors, values, handleChange, handleSubmit,
        }) => (
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3" controlId="formControlInputRename">
                <Form.Label>{t('modal.channelName')}</Form.Label>
                <Form.Control
                  type="text"
                  ref={focus}
                  required
                  name="name"
                  value={leoProfanity.clean(values.name)}
                  onChange={handleChange}
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="outline-primary"
                onClick={() => dispatch(closeModal())}
              >
                {t('modal.cancel')}
              </Button>
              <Button variant="primary" type="submit">
                {t('rename')}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
export default ModalRenameChannel;
