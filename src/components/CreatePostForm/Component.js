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
      step: 0,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { token, post, history } = this.props;
    if (!token) history.push('/');
    if (post) history.push(`/a/${post.category}/${post.id}`);
  }

  onSubmit = post => this.props.attemptCreatePost(post);

  fetchAIImage = async () => {
    if(!!this.props.form.values.title) {
      this.props.setLoading();
      this.setState({"step": 1});
      const res = await fetch(
        'https://dalle-mini.amasad.repl.co/gen/' + this.props.form.values.title,
        {
          method: "GET",
        }
      );
      const imageBlob = await res.blob();

      const formData = new FormData();
      formData.append("file", imageBlob);
      this.setState({"step": 2});
      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
            'pinata_api_key': `44852823011ffd6236df`,
            'pinata_secret_api_key': `d481682ad8693b31d4f217d5b1b9848c2d070fcab73b07d853a111eb3d4a0122`,
            "Content-Type": "multipart/form-data"
        },
      });
      this.setState({'step': 3});
      const imagePath = `https://solarity.mypinata.cloud/ipfs/${resFile.data.IpfsHash}`;
      this.props.change('createPost', 'url', imagePath);
      this.setState({"image": imagePath});
      document.querySelector('#post-image').addEventListener('load', (e) => {
        this.props.clearLoading();
        this.setState({'step': 4})
      })
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
          {
            categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))
          }
        </Field>
        <div style={{display: "flex", width: "100%", gap: "10px"}}>
          <Field name='title' label='title' type='text' component={renderField}/>
          <div style={{marginTop: "25px"}}>
            <SubmitButton type="button" onClick={this.fetchAIImage}>Generate</SubmitButton>
          </div>
        </div>
        {(this.state.step != 1 && this.state.step != 2) && (
          <div style={{width: "100%"}}>  
            {this.props.form.values.type === 'link' && (
              <div style={{width: "100%", display: (this.state.step == 4 ? "block": "none")}}>
                <img src={this.state.image} id="post-image" alt="stable diffusion" />
                <Field name='url' label='url' type='url' component={renderField} />
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
          </div>
        )}
        {this.state.step == 1 && (
          <div style={{width: "100%"}}>generating an image from title</div>
          )}
        {this.state.step == 2 && (
          <div style={{width: "100%"}}>uploading an generated image to IPFS</div>
        )}
        {this.state.step == 3 && (
          <div style={{width: "100%"}}>loading an generated image from IPFS</div>
        )}
        <SubmitButton type='submit'>create post</SubmitButton>
      </Form>
    );
  }
}

export default CreatePostForm;
