import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, change } from 'redux-form';
import {
  titleValidator,
  textPostValidator,
  typeValidator,
  urlValidator
} from '../../util/validators';
import { attemptCreatePost, setLoading, clearLoading } from '../../actions/posts';
import categories from '../../categories';
import withAuth from '../../util/withAuth';
import CreatePostForm from './Component';

const validate = fields => {
  const errors = {};
  const title = fields.title ? fields.title : '';
  const type = fields.type ? fields.type : '';
  const text = fields.text ? fields.text : '';
  const url = fields.url ? fields.url : '';

  errors.title = titleValidator(title);
  if (type === 'text') errors.text = textPostValidator(text);
  if (type === 'link') errors.url = urlValidator(url);
  errors.type = typeValidator(type);

  return errors;
};

const mapStateToProps = state => ({
  isFetching: state.posts.isFetching,
  post: state.posts.newPost,
  form: state.form.createPost
});

const mapDispatchToProps = { attemptCreatePost, change, setLoading, clearLoading };

const enhance = compose(
  reduxForm({
    form: 'createPost',
    initialValues: { category: categories[0], type: 'link', url: "" },
    validate
  }),
  withAuth,
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
);

const CreatePostFormContainer = enhance(CreatePostForm);

export default CreatePostFormContainer;
