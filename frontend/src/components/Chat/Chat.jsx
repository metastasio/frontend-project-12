import { useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as leoProfanity from 'leo-profanity';
import { toast } from 'react-toastify';
import {
  Container, Col, Row, Button, InputGroup, Form,
} from 'react-bootstrap';

import MessageItem from './MessageItem';
import { selectChatContent, selectCurrentChatMessages } from '../../store/stateSelectors';
import { useAuthContext, useSocketContext } from '../../hooks';

const Chat = () => {
  const { t } = useTranslation();
  const { handleEmit } = useSocketContext();
  const { authData } = useAuthContext();
  const { entities, currentChannel } = useSelector(selectChatContent);
  const focus = useRef();
  const formRef = useRef();

  const getActiveChannel = (element) => element.id === currentChannel;
  const chat = entities.find(getActiveChannel);
  const currentChatMessages = useSelector(selectCurrentChatMessages(currentChannel));
  const messagesInChat = currentChatMessages.length;

  useEffect(() => focus.current && focus.current.focus(), [chat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const dataChecked = leoProfanity.clean(data.get('body'));
    if (!dataChecked.trim()) {
      formRef.current.reset();
      focus.current.focus();
      return;
    }
    handleEmit('newMessage', {
      body: dataChecked,
      channelId: currentChannel,
      username: authData.username,
    }, () => toast.error(t('toast.networkError')));
    formRef.current.reset();
    focus.current.focus();
  };

  return (
    <Col className="p-0 h-100 d-flex flex-column overflow-hidden">
      <Container className="bg-light mb-4 p-3 shadow-sm small d-flex flex-column">
        <span className="m-0 fw-bold">
          #
          {chat?.name}
        </span>
        <span className="text-muted">
          {t('chat.key', { count: messagesInChat })}
        </span>
      </Container>

      <Container className="px-5 overflow-y-auto overflow-x-hidden">
        {currentChatMessages.map((message) => (
          <MessageItem
            key={message.id}
            body={message.body}
            username={message.username}
          />
        ))}
      </Container>

      <Container className="mt-auto">
        <Row className="px-3">
          <Form onSubmit={handleSubmit} ref={formRef}>
            <InputGroup className="mb-3">
              <Form.Control
                aria-describedby="basic-addon2"
                aria-label="Новое сообщение"
                placeholder={t('chat.messagePlaceHolder')}
                name="body"
                ref={focus}
              />
              <Button variant="info" type="submit">
                {t('send')}
              </Button>
            </InputGroup>
          </Form>
        </Row>
      </Container>
    </Col>
  );
};

export default Chat;
