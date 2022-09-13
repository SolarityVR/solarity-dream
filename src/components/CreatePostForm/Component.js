import React from 'react';
import { Field } from 'redux-form';
import axios from 'axios';
import categories from '../../categories';
import Form from '../shared/form/Form';
import renderField from '../shared/form/renderField';
import SubmitButton from '../shared/form/SubmitButton';

const postTypes = [
  {
    label: 'link',
    value: 'link'
  },
  {
    label: 'text',
    value: 'text'
  }
];

class CreatePostForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      image: "",
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { token, post, history } = this.props;
    if (!token) history.push('/');
    if (post) history.push(`/a/${post.category}/${post.id}`);
  }

  onSubmit = post => this.props.attemptCreatePost(post);

  mapCategories = () => {
    categories.map((category, index) => (
      <option key={index} value={category}>
        {category}
      </option>
    ));
  }

  fetchAIImage = async () => {
    if(!!this.props.form.values.title) {
      const res = await fetch(
        'https://dalle-mini.amasad.repl.co/gen/' + this.props.form.values.title,
        {
          method: "GET",
        }
      );
      const imageBlob = await res.blob();

      const formData = new FormData();
      formData.append("file", imageBlob);
      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
            'pinata_api_key': `a9b1ab4fa77ba1827460`,
            'pinata_secret_api_key': `7db48e97a0aaf470e53e292c22a08a7ed0893d601d8f5748bdb2fc637f832b9a`,
            "Content-Type": "multipart/form-data"
        },
      });
      const imagePath = `https://ipfs.io/ipfs/${resFile.data.IpfsHash}`;
      this.props.change('createPost', 'url', imagePath);
      this.setState({"image": imagePath});
    }
  }

  render() {
    return (
      <Form
        loading={this.props.isFetching}
        onSubmit={this.props.handleSubmit(this.onSubmit)}
        wide
      >
        <Field
          name='type'
          label='type'
          type='radiogroup'
          component={renderField}
          options={postTypes}
        />
        <Field
          name='category'
          label='category'
          type='select'
          component={renderField}
        >
          {this.mapCategories()}
        </Field>
        <div style={{display: "flex", width: "100%", gap: "10px"}}>
          <Field name='title' label='title' type='text' component={renderField}/>
          <div style={{marginTop: "25px"}}>
            <SubmitButton onClick={this.fetchAIImage}>Generate</SubmitButton>
          </div>
        </div>
        {this.props.form.values.type === 'link' && (
          <div style={{width: "100%"}}>
            <Field name='url' label='url' type='url' component={renderField} />
            <img src={this.state.image} alt="stable diffusion" />
          </div>
        )}
        {this.props.form.values.type === 'text' && (
          <Field
            name='text'
            label='text'
            type='textarea'
            component={renderField}
          />
        )}
        <SubmitButton type='submit'>create post</SubmitButton>
      </Form>
    );
  }
}

export default CreatePostForm;
